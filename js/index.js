function search(cardNames)
{
 let deckHits = new Map();
 for(let cardName of cardNames)
 {
   if(!cardName&&!cardName.trim()) continue; // empty line
   cardName=cardName.trim();
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
 document.write("<table>");
 document.write("<tr><th>Decklist</th><th>Tier</th><th>Hits</th><th>Cards</th></tr>");
 for(const row of rows) document.write(row);
 document.write("</table>");
}

