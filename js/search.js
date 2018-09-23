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
 const result = 
 {
  source: source,
  deckCards: new Map(),
  cardDecks: new Map()
 };
 for(let cardName of cardNames)
 {
   if(!cardName) continue;
   cardName=cardName.trim();
   if(cardName.length<3) continue;
   const decks = source.indexMap.get(cardName);
   if(!decks) {continue;}
   result.cardDecks.set(cardName,decks);
   for(const deck of decks)
   {
     //console.log(`deck ${deck} contains card ${cardName}`);
     let hits = result.deckCards.get(deck);
     if(!hits) {hits=[];}
     hits.push(cardName);
     result.deckCards.set(deck,hits);
   }
 }
// deckCards = [...deckCards.entries()].sort((a,b)=>decklists[a[0]].tier>decklists[b[0]].tier);
 // sort both maps by number of hits
 result.deckCards = [...result.deckCards.entries()].sort((a,b)=>a[1].length<b[1].length);
 result.cardDecks = [...result.cardDecks.entries()].sort((a,b)=>a[1].length<b[1].length);
 return result;
}

function display(searchResult)
{
 const rows = searchResult.deckCards.map(e=>`<tr><td><a href="${e[0]}">${searchResult.source.decklists[e[0]].name}</a></td><td>${searchResult.source.decklists[e[0]].tier}</td><td>${e[1].length}</td><td>${e[1]}</td></tr>\n`);
 const table = document.createElement("table");
 table.innerHTML = "<tr><th>Decklist</th><th>Tier</th><th>Hits</th><th>Cards</th></tr>";
 for(const row of rows)
 {
   table.innerHTML+=row;
 }
 document.writeln(table.outerHTML);
 //if(!tableParent) {tableParent=document.body;}
 //tableParent.appendChild(table); // mixing this with document.write seems to lead to strange behaviour
}
