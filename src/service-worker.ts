/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// import { clientsClaim } from 'workbox-core';
// import { precacheAndRoute } from 'workbox-precaching';
// import initSqlJs from 'sql.js';
import pako from 'pako';
import initSqlJs, { Database as SqlJsDatabase, SqlJsStatic } from 'sql.js';
import sqlJsWasmUrl from 'sql.js/dist/sql-wasm.wasm';
import { headers as getHeaders } from '@mapbox/tiletype';

declare const self: ServiceWorkerGlobalScope;

let _sql: SqlJsStatic;
const _dbs: Record<string, SqlJsDatabase> = {};

// clientsClaim();
// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
// precacheAndRoute(self.__WB_MANIFEST);

// let _sql;
// const _dbs = {};

// const getSql = async () => {
//   if (!_sql) {
//     _sql = await initSqlJs({
//       // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
//       // You can omit locateFile completely when running in node
//       locateFile: file => `sql-wasm.wasm`
//     });
//   }
//   return Promise.resolve(_sql);
// }

// const getDb = async (name: string) => {
//   if (!_dbs[name]) {
//     const sql = await getSql();
//     const data = await fetch('geolife.mbtiles').then(res => res.arrayBuffer());
//     _dbs[name] = new sql.Database(new Uint8Array(data));
//   }
//   return Promise.resolve(_dbs[name]);
// }

// self.importScripts('sql-wasm.js', 'pako_inflate.es5.min.js')

self.addEventListener('install', () => {
  console.log('install')
});

self.addEventListener('activate', () => {
  console.log('activate')
});

const getSql = async () => {
  if (!_sql) {
    _sql = await initSqlJs({
      // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
      // You can omit locateFile completely when running in node
      locateFile: () => sqlJsWasmUrl
    });
  }
  return _sql;
}

const getDb = async (name: string) => {
  if (!_dbs[name]) {
    const sql = await getSql();
    const data = await fetch(name).then(res => res.arrayBuffer());
    _dbs[name] = new sql.Database(new Uint8Array(data));
  }
  return _dbs[name];
};

const respondToMbtilesTileRequest = async (mbtileUrl: string, z: number, x: number, y: number) => {
  const db = await getDb(mbtileUrl);

  // Convert `y` from XYZ format to TMS format. Mbtiles reference tiles using TMS format
  // See: https://github.com/mapbox/node-mbtiles/blob/master/lib/mbtiles.js#L171
  const tmsY = (1 << z) - 1 - y;

  // MB Tile Spec: https://github.com/mapbox/mbtiles-spec/blob/master/1.3/spec.md
  // Gets tile as gzipped Uint8Array() 
  const stmt = db.prepare("SELECT tile_data FROM tiles WHERE zoom_level = $z AND tile_column = $x AND tile_row = $y");
  const result = stmt.getAsObject({ $z: z, $x: x, $y: tmsY });
  const tileData = result?.tile_data as Uint8Array;
  stmt.free();

  if (tileData) {
    // Normally the browser would ungzip it for us automatically using `Content-Encoding` header.
    // However, since we are intercepting and returning a response we need to ungzip for mapbox.
    // See: https://github.com/mapbox/mapbox-gl-js/issues/1567 for similar issue.

    // // Could use something like below when browser support for `CompressionStream` increases
    // See: https://caniuse.com/?search=compressionstream
    // const compressed_blob = new Blob([body], { type: 'application/x-protobuf' });
    // const decompressor = new DecompressionStream("gzip");
    // const decompression_stream = compressed_blob.stream().pipeThrough(decompressor);

    const headers = getHeaders(tileData as Buffer);

    // Inflate response body as if we are the browser.
    // Use `pako` for cross browser support since there is no built-in compression support
    const body = (headers['Content-Encoding'] === 'gzip' || headers['Content-Encoding'] === 'deflate')
      ? pako.inflate(tileData)
      : tileData;

    const response = new Response(body, { 
      status: 200,
      statusText: 'OK',
      headers: new Headers(headers as any),
    });

    return response;
  } else {
    return new Response(undefined, { status: 204 });
  }
}

const mbtilesUrlExp = /\.mbtiles/;

self.addEventListener('fetch', async (event) => {
  // Using a URL object will make routing easier.
  if (mbtilesUrlExp.test(event.request.url)) {
    const url = new URL(event.request.url);
    const [z, x, y] = (url.searchParams.get('tile') ?? '').split(',');
    if (z !== null && x !== null && y !== null) {
      url.searchParams.delete('tile');
      const mbtileUrl = url.toString();
      event.respondWith(respondToMbtilesTileRequest(mbtileUrl, +z, +x, +y))
    }
  } 
});