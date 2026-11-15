import * as THREE from 'three';
import { PALETTE } from './palette.js';

export function createWorld(scene) {
  const group = new THREE.Group();
  scene.add(group);
  const mats = {};
  for (const [name, color] of Object.entries(PALETTE)) {
    mats[name] = new THREE.MeshStandardMaterial({ color, roughness: name === 'accent' ? 0.42 : 0.86, metalness: name === 'metal' ? 0.72 : 0.08 });
  }
  mats.concrete = new THREE.MeshStandardMaterial({ color: 0xc9c9b8, roughness: 0.92 });
  mats.sea = new THREE.MeshStandardMaterial({ color: 0x123c49, roughness: 0.3, metalness: 0.2 });
  mats.dark = new THREE.MeshStandardMaterial({ color: 0x1b292a, roughness: 0.68, metalness: 0.45 });
  mats.amber = new THREE.MeshStandardMaterial({ color: 0xe6a63f, roughness: 0.62 });
  const colliders = [], shootables = [];
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  function box(w, h, d, x, y, z, mat, solid = true) {
    const mesh = new THREE.Mesh(boxGeo, mats[mat]);
    mesh.scale.set(w, h, d); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    if (solid) { colliders.push(new THREE.Box3().setFromObject(mesh)); shootables.push(mesh); }
    return mesh;
  }
  function cylinder(rt, rb, h, x, y, z, mat, segments = 20) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segments), mats[mat]);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh;
  }
  function label(text, x, y, z, color = '#e8dfc6') {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#122323'; ctx.fillRect(0, 0, 256, 64); ctx.fillStyle = color;
    ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center'; ctx.fillText(text, 128, 43);
    const texture = new THREE.CanvasTexture(canvas); const m = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.52), m); sign.position.set(x, y, z); group.add(sign); return sign;
  }
  // Breakwater deck, seawall cap and the waterline on either side.
  box(48, 0.5, 38, 0, -0.25, 0, 'concrete');
  box(50, 3.4, 0.8, 0, 1.45, -18.6, 'concrete');
  box(50, 3.4, 0.8, 0, 1.45, 18.6, 'concrete');
  box(48, 0.3, 16, 0, -0.75, -27, 'sea', false); box(48, 0.3, 16, 0, -0.75, 27, 'sea', false);
  // Three lanes; hard cover is shared by movement and bullet occlusion.
  box(0.45, 4.1, 37, -24, 2.05, 0, 'concrete'); box(0.45, 4.1, 37, 24, 2.05, 0, 'concrete');
  // Service hall, open entries at both ends.
  box(11, 4.2, 0.45, -5.2, 2.1, -10, 'concrete'); box(11, 4.2, 0.45, -5.2, 2.1, 10, 'concrete');
  box(0.45, 4.2, 14, -10.7, 2.1, -17, 'concrete'); box(0.45, 4.2, 14, 0.3, 2.1, -17, 'concrete');
  box(0.45, 4.2, 14, -10.7, 2.1, 17, 'concrete'); box(0.45, 4.2, 14, 0.3, 2.1, 17, 'concrete');
  // Cylindrical relay machinery hall and its rusted outer rings.
  cylinder(8.4, 8.4, 6.2, 11.5, 3.1, 0, 'concrete', 32);
  cylinder(7.8, 7.8, 6.4, 11.5, 3.25, 0, 'dark', 32);
  cylinder(7.2, 7.2, 5.5, 11.5, 3.35, 0, 'concrete', 32);
  cylinder(6.7, 6.7, 5.3, 11.5, 3.45, 0, 'dark', 32);
  // Interior machinery blocks and a thick central power drum.
  cylinder(2.8, 3.2, 4.4, 11.5, 2.2, 0, 'metal', 24);
  cylinder(2.25, 2.55, 4.8, 11.5, 2.45, 0, 'dark', 24);
  cylinder(0.42, 0.55, 6.2, 11.5, 5.4, 0, 'amber', 16);
  for (let i=0;i<8;i++){const a=i*Math.PI/4;const x=11.5+Math.cos(a)*6.95,z=Math.sin(a)*6.95;box(1.1,4.2,0.45,x,3.1,z,'concrete');}
  // Antenna mast, cross-bracing and directional dish over the hall.
  cylinder(0.28,0.42,13,11.5,10.3,0,'metal',12);
  cylinder(0.18,0.22,4.3,11.5,17.5,0,'amber',12);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const brace=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,8.6,8),mats.metal);brace.position.set(11.5+Math.cos(a)*1.35,9.3,Math.sin(a)*1.35);brace.rotation.z=Math.cos(a)*0.19;brace.rotation.x=Math.sin(a)*0.19;group.add(brace);}
  const dish=new THREE.Mesh(new THREE.SphereGeometry(2.2,20,12,0,Math.PI*2,0,Math.PI*0.54),mats.metal);dish.position.set(11.5,16.7,0);dish.rotation.x=Math.PI;group.add(dish);
  cylinder(0.12,0.12,3.4,11.5,15.8,0,'amber',10);
  // Dock route: crates, bollards, railings and overhead cables.
  box(4.5,1.5,2.2,-17,0.75,-9,'metal'); box(4.5,1.5,2.2,-17,0.75,2,'dark');
  box(3.2,1.2,2.0,-15,0.6,12,'metal'); box(1.8,2.1,1.8,-20,1.05,10,'dark');
  for(const z of [-15,-10,-5,0,5,10,15]) cylinder(0.24,0.32,0.65,-22,0.32,z,'amber',10);
  box(0.25,1.1,15,-22.7,0.6,0,'metal',false); box(0.25,1.1,15,-20.8,0.6,0,'metal',false);
  // Raised relay catwalk with stairs and a visible stair-edge rhythm.
  box(5.7,0.42,10,1.5,2.4,-1,'metal'); box(0.36,1.1,10,1.5,3,-5.6,'amber',false);
  for(let i=0;i<6;i++)box(3.6,0.32,0.75,1.4,0.25+i*0.31,-6.3+i*0.75,'concrete');
  for(const x of [-1.2,4.2]){box(0.14,0.8,10,x,2.95,-1,'amber',false);}
  // A site in antenna court, B site in the turbine/service hall.
  cylinder(2.35,2.35,0.09,11.5,0.05,0,'amber',32); cylinder(1.65,1.65,0.1,-3,0.05,0,'amber',24);
  box(2.4,0.05,3.4,11.5,0.06,0,'amber',false); box(3.6,0.05,2.2,-3,0.06,0,'amber',false);
  label('A / DISH COURT',11.5,5,8.3); label('B / TURBINE HALL',-4.9,3.9,-10.2); label('DOCK',-18,2,-17.9); label('SERVICE',-5.2,2,17.9); label('RELAY',12,2,-8.2);
  // Amber hazard stripes and cable trays make route boundaries legible.
  for(let i=0;i<12;i++){box(0.26,0.025,1.05,-7.5+i*0.75,0.015,-10.5,'amber',false);box(0.26,0.025,1.05,-7.5+i*0.75,0.015,10.5,'amber',false);}
  box(0.32,0.32,24,-11.6,3.9,0,'metal',false); box(0.32,0.32,24,-10.8,3.9,0,'metal',false);
  // Mooring drums, cable reels and containers give the dock scale and landmarks.
  for(const [x,z] of [[-20,-3],[-20,5],[-15,-15],[0,15],[20,13]]){cylinder(0.9,0.9,0.55,x,0.28,z,'metal',18);cylinder(0.13,0.13,0.7,x,0.34,z,'amber',12);}
  box(3.2,2.2,2.4,20,1.1,-14,'metal'); box(3.2,2.2,2.4,18,1.1,14,'dark');
  const sky=new THREE.HemisphereLight(0xcfe4e1,0x3b4943,1.35);scene.add(sky);
  const sun=new THREE.DirectionalLight(0xffd49a,2.7);sun.position.set(-15,25,17);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-32;sun.shadow.camera.right=32;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.far=80;sun.shadow.bias=-0.0007;scene.add(sun);
  const bounce=new THREE.DirectionalLight(0x79b8c2,0.65);bounce.position.set(12,9,-16);scene.add(bounce);
  return {colliders,shootables,group};
}
