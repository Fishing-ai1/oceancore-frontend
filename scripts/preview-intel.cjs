const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'../fishing-ai-frontend');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const port=Number(process.env.PORT||4178);
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(req.method!=='GET'){res.writeHead(405);return res.end();}
    if(url.pathname==='/api/pelagic/grid'){
      const upstream=await fetch('https://fishing-ai-backend.onrender.com'+url.pathname+url.search,{signal:AbortSignal.timeout(55000)});
      res.writeHead(upstream.status,{'Content-Type':'application/json'});return res.end(await upstream.text());
    }
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    const content=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(content);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:502);res.end('Preview request failed');}
}).listen(port,'127.0.0.1',()=>console.log('Fishing Intel preview: http://127.0.0.1:'+port+'/fishing-intel.html'));
