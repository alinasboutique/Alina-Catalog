#!/usr/bin/env python3
"""Copy public optimized catalog images to GitHub Pages without deleting Supabase files."""
import json, os, pathlib, time, urllib.parse, urllib.request
BASE = "https://zbfqhmiqjcvicqlidswo.supabase.co"
KEY = os.environ["SUPABASE_PUBLISHABLE_KEY"]
ROOT = pathlib.Path("static/catalog-images")
ROOT.mkdir(parents=True, exist_ok=True)
headers = {"apikey": KEY, "Authorization": "Bearer " + KEY}
def rows(table, cols, filter_query):
    out=[]
    for offset in range(0,2000,500):
        url=BASE+"/rest/v1/"+table+"?select="+urllib.parse.quote(cols,safe=",")+"&"+filter_query+"&limit=500&offset="+str(offset)
        req=urllib.request.Request(url,headers=headers)
        with urllib.request.urlopen(req,timeout=45) as response:
            batch=json.load(response)
        out.extend(batch)
        if len(batch)<500: break
    return out
items=[]
for row in rows("catalog_product_photos","id,image_url","image_url=like.*%2Foptimized%2F*"):
    items.append(("catalog",str(row["id"]),row["image_url"]))
for row in rows("catalog_categories","id,image_url","image_url=like.*%2Foptimized%2F*"):
    items.append(("category",str(row["id"]),row["image_url"]))
for row in rows("mot_model_photos","id,image_url","image_url=like.optimized%2F*"):
    items.append(("mot",str(row["id"]),BASE+"/storage/v1/object/public/mot-models/"+row["image_url"]))
mapping={}
failed=[]
for idx,(kind,id,url) in enumerate(items,1):
    if not url.startswith(BASE+"/storage/v1/object/public/"): continue
    dest=ROOT/(kind+"-"+id+".webp")
    if not dest.exists() or dest.stat().st_size<100:
        for attempt in range(3):
            try:
                req=urllib.request.Request(url,headers={"User-Agent":"CatalogPhotoBackup/1.0"})
                with urllib.request.urlopen(req,timeout=45) as response:
                    data=response.read()
                    content_type=response.headers.get("Content-Type","")
                if len(data)<100 or not (data.startswith(b"RIFF") and data[8:12]==b"WEBP"):
                    raise ValueError("Unexpected image format: "+content_type)
                dest.write_bytes(data)
                break
            except Exception as exc:
                if attempt==2: failed.append((kind,id,str(exc)))
                else: time.sleep(2*(attempt+1))
    if dest.exists() and dest.stat().st_size>100:
        mapping[url]="/Alina-Catalog/static/catalog-images/"+dest.name
    if idx%100==0: print(f"Processed {idx}/{len(items)} images",flush=True)
pathlib.Path("static/catalog-image-map.json").write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+"\n")
print(f"Backed up {len(mapping)} of {len(items)} optimized images; errors: {len(failed)}")
if failed:
    print("Failed:",failed[:15])
    raise SystemExit(1)
