import express from 'express';
import proxy from 'http-proxy-middleware';


export const createDocumentProxy = ({app, proxyUrl}) => {
    app.use(proxy({
        target: proxyUrl,
        ws: true,
        changeOrigin: true
    }));
};


export const createDocumentStaticProvider = ({app, documentDir}) => {
    app.use(express.static(documentDir));
};
