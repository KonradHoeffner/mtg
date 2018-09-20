 // testing fuse, optimize later by precalculating in node
 var options =
 {
  shouldSort: false,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 50,
  minMatchCharLength: 3,
  keys: ["n"]
 };

const TIER_LIST = 
{
 indexMap: indexMapTappedOut,
 decklists: decklistsTappedOut
};

const CONGLOMERATE =
{
 indexMap: indexMapReddit,
 decklists: decklistsReddit
};

function fuzzySearch(source,cardNames)
{
 const cards = [];
 for(const card of source.indexMap.keys())
 {
  cards.push({n:card});
 }
 var fuse = new Fuse(cards, options); // could be cached

 const correctedNames = [];
 for(let cardName of cardNames)
 {
   if(!cardName) continue;
   result = fuse.search(cardName);
   if(result.length>0) correctedNames.push(result[0].n);
 }
 return exactSearch(source,correctedNames);
}
 
function exactSearch(source,cardNames)
{
 let deckHits = new Map();
 for(let cardName of cardNames)
 {
   if(!cardName) continue;
   cardName=cardName.trim();
   if(cardName.length<3) continue;
   const decks = source.indexMap.get(cardName);
   if(!decks) {continue;}
   for(const deck of decks)
   {
     //console.log(`deck ${deck} contains card ${cardName}`);
     let hits = deckHits.get(deck);
     if(!hits) {hits=[];}
     hits.push(cardName);
     deckHits.set(deck,hits);
   }
 }
// deckHits = [...deckHits.entries()].sort((a,b)=>decklists[a[0]].tier>decklists[b[0]].tier);
 return deckHits = [...deckHits.entries()].sort((a,b)=>a[1].length<b[1].length);
}

function display(source, deckHits)
{
 const rows = deckHits.map(e=>`<tr><td><a href="${e[0]}">${source.decklists[e[0]].name}</a></td><td>${source.decklists[e[0]].tier}</td><td>${e[1].length}</td><td>${e[1]}</td></tr>\n`);
 const table = document.getElementById("resulttable");
 table.style.visibility="visible";
 for(const row of rows)
 {
   table.innerHTML+=row;
 }
}
