const STORE="gauntletgallery.myshopify.com", API_V="2024-10", THEME=149213806727;
const TOKEN=process.env.SHOPIFY_TOKEN, TARGET=process.argv[2];
if(!TOKEN||!TARGET){console.error("Usage: SHOPIFY_TOKEN=xxx node remove_section.js <sectionId>");process.exit(1);}
const api=async(m,p,b)=>{const r=await fetch(`https://${STORE}/admin/api/${API_V}${p}`,{method:m,headers:{"X-Shopify-Access-Token":TOKEN,"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});const t=await r.text();if(!r.ok)throw new Error(`${m} ${p} ${r.status}: ${t}`);return JSON.parse(t);};
(async()=>{
  const a=await api("GET",`/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const d=JSON.parse(a.asset.value);
  if(!d.sections[TARGET]){console.log(`section "${TARGET}" not present`);return;}
  delete d.sections[TARGET];
  d.order=d.order.filter(x=>x!==TARGET);
  const v=JSON.stringify(d,null,2);
  const r=await api("PUT",`/themes/${THEME}/assets.json`,{asset:{key:"templates/index.json",value:v}});
  console.log(`✓ Removed "${TARGET}". updated_at=${r.asset.updated_at}`);
  console.log(`New order: ${d.order.join(", ")}`);
})().catch(e=>{console.error("✗",e.message);process.exit(1);});
