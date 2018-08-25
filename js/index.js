 // testing fuse, optimize later by precalculating in node
 var options = {
  shouldSort: false,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 50,
  minMatchCharLength: 3,
  keys: ["n"]
 };


function fuzzySearch(indexMap,decklists,cardNames)
{
 const cards = [];
 for(const card of indexMap.keys())
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
 search(indexMap,decklists,correctedNames);
}
 
function search(indexMap,decklists,cardNames)
{
 let deckHits = new Map();
 for(let cardName of cardNames)
 {
   if(!cardName) continue;
   cardName=cardName.trim();
   if(cardName.length<3) continue;
   const decks = indexMap.get(cardName);
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
 deckHits = [...deckHits.entries()].sort((a,b)=>a[1].length<b[1].length);
 const rows = deckHits.map(e=>`<tr><td><a href="${e[0]}">${decklists[e[0]].name}</a></td><td>${decklists[e[0]].tier}</td><td>${e[1].length}</td><td>${e[1]}</td></tr>\n`);
 const table = document.getElementById("resulttable");
 for(const row of rows)
 {
   table.innerHTML+=row;
 }
}
