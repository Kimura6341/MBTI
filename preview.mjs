import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('dist');
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(url.pathname);const file=path.resolve(base,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
});
const port=Number(process.env.PORT||4173);
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
