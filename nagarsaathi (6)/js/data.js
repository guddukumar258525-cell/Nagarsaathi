/* NagarSaathi — sample data (swap with API calls later: see api.js hooks in app.js) */
const CATS = {
  road:    {e:'🛣️', n:'Roads & Potholes',      dept:'Public Works Dept.',      c:'#F07010'},
  light:   {e:'💡', n:'Street Lights',          dept:'Electrical Dept.',        c:'#E5A400'},
  garbage: {e:'🗑️', n:'Garbage & Waste',        dept:'Solid Waste Mgmt.',       c:'#3E9A2A'},
  water:   {e:'💧', n:'Water Leakage',          dept:'Water Supply Dept.',      c:'#1F7AE0'},
  traffic: {e:'🚦', n:'Traffic & Signals',      dept:'Traffic Police / Signals',c:'#C23B8A'},
  infra:   {e:'🏗️', n:'Infrastructure',         dept:'Engineering Dept.',       c:'#7A5A3C'},
  park:    {e:'🌳', n:'Parks & Public Spaces',  dept:'Garden Dept.',            c:'#1E8E6E'},
  safety:  {e:'⚠️', n:'Safety Issues',          dept:'Ward Safety Cell',        c:'#E23B3B'}
};
const STATUS = {
  reported:{n:'Reported',   c:'var(--st-reported)'},
  verified:{n:'Verified',   c:'var(--st-reported)'},
  progress:{n:'In Progress',c:'var(--st-progress)'},
  resolved:{n:'Resolved',   c:'var(--st-resolved)'}
};
const WARDS = [
  {id:'pimpri',   n:'Pimpri',     x:500,y:300,w:210,h:150, score:78, pop:'92k'},
  {id:'chinchwad',n:'Chinchwad',  x:690,y:210,w:200,h:150, score:84, pop:'88k'},
  {id:'akurdi',   n:'Akurdi',     x:300,y:210,w:200,h:150, score:71, pop:'64k'},
  {id:'nigdi',    n:'Nigdi',      x:130,y:140,w:200,h:140, score:88, pop:'71k'},
  {id:'bhosari',  n:'Bhosari',    x:660,y:60, w:230,h:130, score:66, pop:'79k'},
  {id:'wakad',    n:'Wakad',      x:320,y:420,w:210,h:130, score:81, pop:'83k'},
  {id:'hinjewadi',n:'Hinjewadi',  x:90, y:380,w:210,h:150, score:74, pop:'76k'},
  {id:'kothrud',  n:'Kothrud',    x:560,y:450,w:230,h:120, score:90, pop:'95k'}
];
const ME = {name:'Guddu Kumar', ward:'pimpri', xp:1240, streak:6, avatar:'GK'};
const D = (n)=>{const d=new Date('2026-11-25');d.setDate(d.getDate()-n);return d.toISOString().slice(0,10)};
const ISSUES = [
 {id:'NS-1042',title:'Deep pothole near Pimpri flyover',cat:'road',ward:'pimpri',status:'progress',urgent:true,x:560,y:340,date:D(6),loc:'Mumbai-Pune Rd, near Pimpri flyover',up:128,by:'Rohan Patil',desc:'A 2-foot wide pothole has formed on the left lane. Two-wheelers are skidding every day, especially after rain.',steps:[0,5,3,null]},
 {id:'NS-1041',title:'Street light dead for 2 weeks',cat:'light',ward:'chinchwad',status:'reported',urgent:false,x:760,y:270,date:D(3),loc:'Gandhi Peth Lane 4, Chinchwad',up:42,by:'Sunita More',desc:'The whole lane is dark after 7 PM. Women and senior citizens feel unsafe walking back from the market.',steps:[0,null,null,null]},
 {id:'NS-1040',title:'Garbage not collected for 5 days',cat:'garbage',ward:'akurdi',status:'progress',urgent:false,x:380,y:290,date:D(8),loc:'Sector 26, Akurdi',up:77,by:'Aman Shaikh',desc:'The collection van has skipped our society lane. The bins are overflowing and attracting stray dogs.',steps:[0,6,4,null]},
 {id:'NS-1039',title:'Water pipeline burst on main road',cat:'water',ward:'nigdi',status:'resolved',urgent:false,x:210,y:210,date:D(14),loc:'Bhakti Shakti Chowk, Nigdi',up:203,by:'Kavita Joshi',desc:'Clean drinking water is gushing out since morning, flooding the road and wasting thousands of litres.',steps:[0,13,12,10]},
 {id:'NS-1038',title:'Traffic signal stuck on red',cat:'traffic',ward:'bhosari',status:'reported',urgent:true,x:790,y:130,date:D(1),loc:'Bhosari Chowk Signal',up:95,by:'Vikram Deshmukh',desc:'The signal stays red for 6+ minutes. Heavy jam during office hours; drivers are jumping the light.',steps:[0,null,null,null]},
 {id:'NS-1037',title:'Broken footpath tiles near school',cat:'infra',ward:'wakad',status:'progress',urgent:false,x:420,y:490,date:D(11),loc:'Wakad Rd, opp. Lokmanya School',up:58,by:'Neha Kulkarni',desc:'Loose tiles and open drain gaps. Children walking to school have tripped multiple times.',steps:[0,9,6,null]},
 {id:'NS-1036',title:'Park benches vandalised',cat:'park',ward:'kothrud',status:'resolved',urgent:false,x:680,y:510,date:D(19),loc:'Karve Garden, Kothrud',up:31,by:'Prakash Iyer',desc:'Benches broken and graffiti all over the walking track. The park looks neglected.',steps:[0,18,15,12]},
 {id:'NS-1035',title:'Open manhole without cover',cat:'safety',ward:'pimpri',status:'progress',urgent:true,x:610,y:380,date:D(2),loc:'Pimpri Market Rd',up:164,by:'Farah Khan',desc:'An open manhole in the middle of a busy market lane. Extremely dangerous at night — please cover immediately.',steps:[0,1,1,null]},
 {id:'NS-1034',title:'Waterlogging after every rain',cat:'infra',ward:'hinjewadi',status:'reported',urgent:false,x:190,y:450,date:D(5),loc:'Phase 1 Underpass, Hinjewadi',up:118,by:'Ankit Sharma',desc:'The underpass fills with knee-deep water even after 20 minutes of rain, trapping vehicles.',steps:[0,null,null,null]},
 {id:'NS-1033',title:'Pothole cluster on service road',cat:'road',ward:'chinchwad',status:'resolved',urgent:false,x:830,y:310,date:D(22),loc:'Chinchwad Station Rd',up:88,by:'Meera Pawar',desc:'Multiple potholes outside the station making commuting a nightmare for auto drivers.',steps:[0,21,18,16]},
 {id:'NS-1032',title:'Illegal garbage dumping at plot',cat:'garbage',ward:'wakad',status:'reported',urgent:false,x:470,y:520,date:D(4),loc:'Vishal Nagar, Wakad',up:36,by:'Sandeep Rane',desc:'Trucks dump construction debris and household waste on the empty plot at night.',steps:[0,null,null,null]},
 {id:'NS-1031',title:'Street light flickering all night',cat:'light',ward:'nigdi',status:'resolved',urgent:false,x:250,y:250,date:D(16),loc:'Nigdi Pradhikaran, Sector 27',up:19,by:'Rekha Gaikwad',desc:'Light flickers and buzzes, keeping the neighbourhood awake.',steps:[0,15,14,12]},
 {id:'NS-1030',title:'Leaking tap stand at bus stop',cat:'water',ward:'kothrud',status:'progress',urgent:false,x:620,y:480,date:D(7),loc:'Kothrud Depot Bus Stop',up:23,by:'Imran Sayyed',desc:'The public tap runs continuously, creating a muddy puddle on the platform.',steps:[0,6,3,null]},
 {id:'NS-1029',title:'Missing zebra crossing paint',cat:'traffic',ward:'akurdi',status:'reported',urgent:false,x:420,y:250,date:D(9),loc:'Akurdi Railway Station Rd',up:51,by:'Pooja Naik',desc:'Faded zebra crossing right at a school gate. Vehicles never slow down.',steps:[0,null,null,null]},
 {id:'NS-1028',title:'Leaning electric pole after storm',cat:'safety',ward:'bhosari',status:'progress',urgent:true,x:720,y:100,date:D(1),loc:'MIDC Bhosari, Gate 3',up:142,by:'Dinesh Bhoir',desc:'Pole is tilted 30° above a footpath with live wires. Area cordoned by residents.',steps:[0,0,0,null]},
 {id:'NS-1027',title:'Overgrown bushes blocking footpath',cat:'park',ward:'pimpri',status:'resolved',urgent:false,x:540,y:410,date:D(25),loc:'Sant Tukaram Nagar',up:14,by:'Shobha Kadam',desc:'Wild growth is forcing pedestrians onto the main road.',steps:[0,24,20,18]},
 {id:'NS-1026',title:'Crumbling compound wall of school',cat:'infra',ward:'nigdi',status:'reported',urgent:false,x:170,y:190,date:D(10),loc:'ZP School, Nigdi Gaothan',up:67,by:'Yogesh Jadhav',desc:'Large cracks and bricks falling near the playground. Needs inspection.',steps:[0,null,null,null]},
 {id:'NS-1025',title:'Sewage overflow in lane',cat:'water',ward:'hinjewadi',status:'progress',urgent:false,x:140,y:420,date:D(12),loc:'Maan Road, Hinjewadi',up:99,by:'Tanvi Gokhale',desc:'Drain water overflows onto the lane with a strong smell. Risk of disease outbreak.',steps:[0,11,7,null]},
 {id:'NS-1024',title:'Speed breaker needed near temple',cat:'traffic',ward:'kothrud',status:'reported',urgent:false,x:740,y:540,date:D(13),loc:'Kothrud Ganpati Temple Rd',up:73,by:'Madhav Kale',desc:'Vehicles speed here and several near-misses with devotees crossing.',steps:[0,null,null,null]}
];
const COMMENTS = {
  'NS-1042':[{u:'Sunita More',t:'Fell here yesterday. Please fix before the weekend!',d:'2d ago'},{u:'Ward Officer · Pimpri',t:'Team assigned. Asphalt patching scheduled for Thursday.',d:'1d ago',off:true}],
  'NS-1035':[{u:'Rohan Patil',t:'Placed a barricade temporarily with locals. Please send a cover fast.',d:'1d ago'}]
};
const BOARD = [
  {n:'Rohan Patil',ward:'Pimpri',xp:3820,w:410,c:'#F07010'},
  {n:'Kavita Joshi',ward:'Nigdi',xp:3610,w:520,c:'#3E9A2A'},
  {n:'Farah Khan',ward:'Pimpri',xp:3195,w:380,c:'#1B3A8C'},
  {n:'Aman Shaikh',ward:'Akurdi',xp:2870,w:300,c:'#C23B8A'},
  {n:'Neha Kulkarni',ward:'Wakad',xp:2540,w:260,c:'#1E8E6E'},
  {n:'Vikram Deshmukh',ward:'Bhosari',xp:2210,w:290,c:'#E5A400'},
  {n:'Guddu Kumar',ward:'Pimpri',xp:1240,w:180,c:'#F07010',me:true},
  {n:'Tanvi Gokhale',ward:'Hinjewadi',xp:1105,w:140,c:'#7A5A3C'}
];
const BADGES = [
  {e:'🦸',n:'City Hero',d:'Report 10 valid issues',got:true},
  {e:'🏆',n:'Clean City Champion',d:'5 garbage reports resolved',got:true},
  {e:'🛡️',n:'Road Safety Guardian',d:'Report 5 road hazards',got:true},
  {e:'🔥',n:'7-Day Streak',d:'Act 7 days in a row',got:false},
  {e:'🤝',n:'Community Star',d:'Join 3 clean-up drives',got:false},
  {e:'💧',n:'Water Warrior',d:'Report 3 water leaks',got:true},
  {e:'📸',n:'Eagle Eye',d:'Upload 20 photos',got:false},
  {e:'👑',n:'Ward Legend',d:'Be #1 in your ward',got:false}
];
const ALERTS = [
  {t:'urgent',e:'🌧️',h:'Heavy rain alert — next 6 hours',p:'IMD warns of heavy showers in PCMC. Avoid low-lying roads and underpasses.',when:'12 min ago',unread:true,k:'rain'},
  {t:'urgent',e:'⚠️',h:'Urgent issue near you: open manhole',p:'NS-1035 Pimpri Market Rd — 300 m from your location. Avoid the lane.',when:'40 min ago',unread:true,k:'nearby'},
  {t:'ok',e:'✅',h:'Your issue NS-1039 is Resolved',p:'Water pipeline at Bhakti Shakti Chowk has been repaired. +50 XP awarded!',when:'3 h ago',unread:true,k:'status'},
  {t:'warn',e:'🚧',h:'Road blocked: Mumbai-Pune Rd',p:'Lane closure near Pimpri flyover for pothole repair. Expect 20 min delays.',when:'5 h ago',unread:false,k:'road'},
  {t:'warn',e:'🚰',h:'Water supply disruption tomorrow',p:'No supply in Akurdi & Nigdi from 6 AM–2 PM due to pipeline maintenance. Store water today.',when:'Yesterday',unread:false,k:'water'},
  {t:'info',e:'📣',h:'Community announcement',p:'Mega clean-up drive at Pavana riverfront this Sunday 7 AM. Join and earn 200 XP!',when:'Yesterday',unread:false,k:'community'},
  {t:'info',e:'🔔',h:'NS-1042 moved to In Progress',p:'Ward officer assigned a team to the pothole near Pimpri flyover.',when:'2 days ago',unread:false,k:'status'}
];
const DRIVES = [
  {id:1,m:'NOV',d:'29',t:'Pavana Riverfront Clean-up',w:'Pimpri · 7:00 AM',go:86,max:120,xp:200},
  {id:2,m:'DEC',d:'06',t:'Plant 500 Saplings',w:'Nigdi Gaothan · 8:00 AM',go:54,max:80,xp:250},
  {id:3,m:'DEC',d:'13',t:'Footpath Repair Volunteers',w:'Wakad · 9:00 AM',go:21,max:40,xp:150}
];
const POSTS = [
  {u:'Kavita Joshi',c:'#3E9A2A',t:'Nigdi lane cleaned by 40 volunteers today! 🌱 Collected 180 kg of plastic waste.',e:'🧹',l:132,when:'2h ago'},
  {u:'Rohan Patil',c:'#F07010',t:'Pothole at Pimpri flyover finally getting patched. Thank you ward team & everyone who upvoted! 🙏',e:'🛣️',l:98,when:'6h ago'},
  {u:'Neha Kulkarni',c:'#1E8E6E',t:'Kids from Lokmanya School helped paint a new zebra crossing. Proud moment!',e:'🎨',l:210,when:'Yesterday'}
];
const ACHIEVE = [
  {e:'🗑️',n:'18.4 tonnes',d:'Waste collected this month'},
  {e:'🌳',n:'1,240',d:'Saplings planted'},
  {e:'🛣️',n:'312',d:'Potholes fixed'},
  {e:'💡',n:'890',d:'Street lights restored'}
];
