function search(cardNames)
{
 let deckHits = new Map();
 for(const cardName of cardNames)
 {
   const decks = indexMap.get(cardName);
   if(!decks) {continue;}
   for(const deck of decks)
   {
     let hits = deckHits.get(deck);
     if(!hits) {hits=0;}
     hits++;
     deckHits.set(deck,hits);
   }
 }
 deckHits = [...deckHits.entries()].sort((a,b)=>a[1]<b[1]);
 const rows = deckHits.map(e=>`<tr><td><a href="${e[0]}">${e[0].replace("http://tappedout.net/mtg-decks/","")}</a></td><td>${e[1]}</td></tr>\n`);
 document.write("<table>");
 for(const row of rows) document.write(row);
 document.write("</table>");
}
