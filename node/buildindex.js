var ineed = require('ineed');

const TIER_LIST_URL = "http://tappedout.net/mtg-decks/list-multiplayer-edh-generals-by-tier";
//const decklistUrls = ["http://tappedout.net/mtg-decks/food-chain-tazri/","http://tappedout.net/mtg-decks/jeleva-slim/"];
const index = new Map();

ineed.collect.hyperlinks.from(TIER_LIST_URL,(err,response,result)=>
{
 const decklistUrls = result.hyperlinks.filter(a=>
      a.href.startsWith("http://tappedout.net/mtg-decks/")
   &&!a.href.startsWith("http://tappedout.net/mtg-decks/list-multiplayer-edh-generals-by-tier"))
   .map(a=>a.href);
  indexDecklists(decklistUrls);
});

function indexDecklists(urls)
{
 console.log(urls);
}
