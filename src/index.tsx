import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { App } from "./App/App";
import { Map } from "./Map/Map";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);
root.render((
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate replace to="/mbtiles-service-worker" />} />
        <Route path=":demo" element={<Map />} />
      </Route>
    </Routes>
  </HashRouter>
));

if ('serviceWorker' in navigator) {
  console.log('Service workers allowed')
  navigator.serviceWorker.register("service-worker.js")
    .then(() => {
      console.log('Service worker registered')
      navigator.serviceWorker.onmessage = (e) => {
        console.log(e)
      };
    })
    .catch((error) => console.error(error));
} else {
  console.error('Service workers unsupported')
}
