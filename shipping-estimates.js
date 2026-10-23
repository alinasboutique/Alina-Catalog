/* Shipping estimates include product and protective packing. Adjust after weighing representative parcels. */
(function(){
 const weights={
 'bcd4d25c-f602-462f-9cac-598dcc01b5da':180,'03124299-f160-400b-a687-428b639cab0c':130,'e54f85b2-e30a-40ec-a6c3-4cb9e4d606a4':160,'0c0f8ad0-eb9f-4f48-b273-5743f1b41ce6':320,
 'd9a0d72a-4902-440e-9741-895da8bd361d':35,'7bbd1d35-0685-4cf2-96cd-5d63c051d676':35,
 '18d494d2-fc71-4589-a759-bae162309e0d':240,'a03a4164-8b2d-4a23-9386-dca82e3d4d71':180,
 'b5a7e09b-2f6f-4879-ba9f-d0792cfb0411':650,
 '57ba225c-2b99-40c9-bc3b-34c0131cf272':75,
 'b39b8ccf-8262-45f1-9178-1540d85af599':35,'c73a5355-a7aa-498d-8667-0f9ccda21433':35,'15a39422-5a75-4972-9d9f-175fe57c7d9e':35,
 'd38c9698-d266-4ba2-bd59-66b5c93277fc':30,'350d44ce-6e05-4b5a-abcc-fe54014668a9':30,
 '9c12c167-bcb0-4234-8220-dccec091034d':550,'d45c0983-1692-49a2-81a5-63adb3b7f8d8':500,'4118dc50-e780-4c5a-b9cf-6d77c51aca2a':550,
 '4321c8e2-2db8-4621-8d47-8b749762bb4a':2200,
 'a1f125df-9ca3-4f34-9493-f0c597357abf':700,'cf53c323-3998-4608-9e16-deecd9d1027d':1300,
 '41d021dd-1638-47fc-b30a-2b157c2b88c2':1200,
 'b43df5f3-ddd9-43e9-9523-d49e08347d86':90,'281a2d4b-09a3-4f65-a340-ac827cbfd9bb':100,
 'a29bbfb7-0d19-41a7-9180-3106f5777f78':950,'5b916230-6787-4b41-be9d-b837dbd3852b':600,
 '6fd79a93-a99f-4a30-8132-1ff3a81bc6eb':800
 };
 function grams(categoryId,name){
  if(Object.prototype.hasOwnProperty.call(weights,categoryId))return weights[categoryId];
  const s=String(name||'').toLowerCase();
  if(/cufăr|cufar|trusou|set moț|set mot|tăviță|tavita/.test(s))return 1800;
  if(/lumân|luman|pahar|sticlă|sticla|cană|cana/.test(s))return 650;
  if(/tricou|body/.test(s))return 240;
  if(/invitaț|invit at|plic/.test(s))return 35;
  if(/topper/.test(s))return 200;
  if(/cutie|cadou|set/.test(s))return 850;
  return 450;
 }
 function shipping(gramsTotal){return gramsTotal>1000?8.95:5.95}
 window.catalogShipping={grams,shipping,weights};
})();