const STORE="gauntletgallery.myshopify.com", API_V="2024-10", THEME=149213806727;
const TOKEN=process.env.SHOPIFY_TOKEN;
if(!TOKEN){console.error("Missing SHOPIFY_TOKEN");process.exit(1);}
const api=async(m,p,b)=>{const r=await fetch(`https://${STORE}/admin/api/${API_V}${p}`,{method:m,headers:{"X-Shopify-Access-Token":TOKEN,"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});const t=await r.text();if(!r.ok)throw new Error(`${m} ${p} ${r.status}: ${t}`);return JSON.parse(t);};
(async()=>{
  const a=await api("GET",`/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const d=JSON.parse(a.asset.value);
  const id="artist-marquee";
  d.sections[id]={
    type:"scrolling-text",
    settings:{
      text:"SHEPARD FAIREY · KAWS · BE@RBRICK · BANKSY · DEATH NYC · MR. BRAINWASH · D*FACE · ",
      repeat_text:true,
      link:"/collections/all",
      desktop_text_scale:4,
      mobile_text_scale:2,
      font:"font-heading",
      speed:25,
      direction:"",
      color_scheme:"scheme_2",
      space_above:1,
      space_below:1
    }
  };
  const newOrder=[];
  for(const s of d.order){newOrder.push(s); if(s==="blog-posts-gallery") newOrder.push(id);}
  if(!newOrder.includes(id)) newOrder.push(id);
  d.order=newOrder;
  const r=await api("PUT",`/themes/${THEME}/assets.json`,{asset:{key:"templates/index.json",value:JSON.stringify(d,null,2)}});
  console.log(`✓ Added "${id}". updated_at=${r.asset.updated_at}`);
  console.log(`New order: ${d.order.join(", ")}`);
})().catch(e=>{console.error("✗",e.message);process.exit(1);});
