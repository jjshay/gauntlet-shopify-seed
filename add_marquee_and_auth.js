const STORE="gauntletgallery.myshopify.com", API_V="2024-10", THEME=149213806727;
const TOKEN=process.env.SHOPIFY_TOKEN;
if(!TOKEN){console.error("Missing SHOPIFY_TOKEN");process.exit(1);}
const api=async(m,p,b)=>{const r=await fetch(`https://${STORE}/admin/api/${API_V}${p}`,{method:m,headers:{"X-Shopify-Access-Token":TOKEN,"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});const t=await r.text();if(!r.ok)throw new Error(`${m} ${p} ${r.status}: ${t}`);return JSON.parse(t);};
(async()=>{
  const a=await api("GET",`/themes/${THEME}/assets.json?asset%5Bkey%5D=templates/index.json`);
  const d=JSON.parse(a.asset.value);

  // Artist name marquee
  const mq="artist-marquee";
  d.sections[mq]={
    type:"scrolling-text",
    settings:{
      text:"SHEPARD FAIREY · KAWS · BE@RBRICK · BANKSY · DEATH NYC · MR. BRAINWASH · D*FACE · ",
      repeat_text:true,
      link:"/collections/all",
      desktop_text_scale:4,
      mobile_text_scale:2,
      font:"font-heading",
      speed:20,
      direction:"",
      color_scheme:"scheme_2",
      space_above:1,
      space_below:1
    }
  };

  // Authenticated-by logo list
  const auth="logo-list";
  d.sections[auth]={
    type:"logo-list",
    blocks:{
      "logo-list-0":{type:"logo",settings:{}},
      "logo-list-1":{type:"logo",settings:{}},
      "logo-list-2":{type:"logo",settings:{}},
      "logo-list-3":{type:"logo",settings:{}}
    },
    block_order:["logo-list-0","logo-list-1","logo-list-2","logo-list-3"],
    settings:{
      title:"Authenticated by",
      max_width:90,
      grayscale:true,
      luminosity:false,
      invert:false,
      show_top_border:true,
      color_scheme:"",
      space_above:1,
      space_below:1
    }
  };

  // Order: marquee after blog-posts-gallery, logo-list after that, newsletter last
  d.order=d.order.filter(x=>x!==mq && x!==auth);
  const newOrder=[];
  for(const s of d.order){
    newOrder.push(s);
    if(s==="blog-posts-gallery"){ newOrder.push(mq); newOrder.push(auth); }
  }
  d.order=newOrder;

  const r=await api("PUT",`/themes/${THEME}/assets.json`,{asset:{key:"templates/index.json",value:JSON.stringify(d,null,2)}});
  console.log(`✓ Pushed. updated_at=${r.asset.updated_at}`);
  console.log(`New order:`);
  d.order.forEach((s,i)=>console.log(`  ${i+1}. ${s}`));
})().catch(e=>{console.error("✗",e.message);process.exit(1);});
