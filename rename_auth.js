const STORE="gauntletgallery.myshopify.com", API_V="2024-10", THEME=149213806727;
const TOKEN=process.env.SHOPIFY_TOKEN;
const api=async(m,p,b)=>{const r=await fetch(`https://${STORE}/admin/api/${API_V}${p}`,{method:m,headers:{"X-Shopify-Access-Token":TOKEN,"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});const t=await r.text();if(!r.ok)throw new Error(`${m} ${p} ${r.status}: ${t}`);return JSON.parse(t);};
(async()=>{
  const a=await api("GET",`/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const d=JSON.parse(a.asset.value);
  d.sections["logo-list"].settings.title="Authentication solutions";
  const r=await api("PUT",`/themes/${THEME}/assets.json`,{asset:{key:"templates/index.json",value:JSON.stringify(d,null,2)}});
  console.log(`✓ Renamed. updated_at=${r.asset.updated_at}`);
})().catch(e=>{console.error("✗",e.message);process.exit(1);});
