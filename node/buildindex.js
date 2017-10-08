var ineed = require('ineed');
var fs = require('fs');
var MultiMap = require("collections/multi-map");

const TIER_LIST_URL = "http://tappedout.net/mtg-decks/list-multiplayer-edh-generals-by-tier";
const DECKLIST_LINKS_FILE = "cache/decklistlinks.json";
const INDEX_FILE = "cache/index.js";
const DECKLISTS = 53; // 53 decklists for tier 1, 1.5 and 2
//const decklistUrls = ["http://tappedout.net/mtg-decks/food-chain-tazri/","http://tappedout.net/mtg-decks/jeleva-slim/"];

let decklistLinks;
if(fs.existsSync(DECKLIST_LINKS_FILE))
{
  console.log("Loading decklists from cache");
  decklistLinks = JSON.parse(fs.readFileSync(DECKLIST_LINKS_FILE, 'utf8'));
  indexDecklists(decklistLinks.slice(0,DECKLISTS));
} else
{

  ineed.collect.hyperlinks.from(TIER_LIST_URL,(err,response,result)=>
  {
    decklistLinks = result.hyperlinks.filter(a=>
      a.href.startsWith("http://tappedout.net/mtg-decks/")
      &&!a.href.startsWith("http://tappedout.net/mtg-decks/list-multiplayer-edh-generals-by-tier")
      &&!a.href.startsWith("http://tappedout.net/mtg-decks/search/"));
      fs.writeFile(DECKLIST_LINKS_FILE,JSON.stringify(decklistLinks));
      indexDecklists(decklistLinks.slice(0,DECKLISTS));
    });
  }

  function indexDecklists(deckLinks)
  {
    //console.log(links);
    const index = new MultiMap();
    const promises = [];
    for(const deckLink of deckLinks)
    {
      const deckUrl = deckLink.href;
      console.log("Fetching cards from decklist "+deckLink.text);
      promises.push(new Promise((resolve,reject)=>
      {
        ineed.collect.hyperlinks.from(deckUrl,(err,response,result)=>
        {
          // quick, dirty and hopefully mostly correct way to extract only the cards belonging to the deck, not the ones being discussed afterwards
          cards = result.hyperlinks.filter(a=>a.href.startsWith("http://tappedout.net/mtg-card/")).slice(0,100);
          for(const cardName of cards.map(card=>card.text))
          {
            const decks = index.get(cardName);
            decks.push(deckUrl);
            index.set(cardName,decks);
          }
          resolve();
        });
      }));
    }
    Promise.all(promises).then(()=>{
      console.log(index.get("Brainstorm"));
      fs.writeFileSync(INDEX_FILE,"var indexMap = "+JSON.stringify(index)+";");
    });
  }
