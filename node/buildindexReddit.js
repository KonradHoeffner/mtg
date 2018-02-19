/* We need DOM parsing so we can't use ineed like for the tier list but instead we use request-promise.*/

const fs = require('fs');
const MultiMap = require("collections/multi-map");

const rp = require('request-promise');
const cheerio = require('cheerio');

const TIER_LIST_URL = "https://www.reddit.com/r/LabManiacs/comments/5si9gw/competitive_edh_decklist_conglomerate/";
const COMMENT = "/r/LabManiacs/comments/5si9gw/competitive_edh_decklist_conglomerate/";
const DECKLIST_LINKS_FILE = "../cache/decklistlinksReddit.json";
const INDEX_FILE = "../cache/indexReddit.js";
const DECKLIST_FILE = "../cache/decklistsReddit.js";

const options = {
  uri: TIER_LIST_URL,
  transform: function (body) {
    return cheerio.load(body);
  }
};


buildIndexReddit();

function buildIndexReddit()
{
 let decklistLinks;
 if(fs.existsSync(DECKLIST_LINKS_FILE))
 {
  console.log("Loading decklists from cache");
  decklistLinks = JSON.parse(fs.readFileSync(DECKLIST_LINKS_FILE, 'utf8'));
  indexDecklists(decklistLinks);
 } else
 {
   rp(options)
  .then(($) => {

const op = $('div.usertext-body.may-blank-within.md-container').first().text();
    console.log(op);
  })
  .catch((err) => {
    console.log(err);
});
/*
   decklistLinks = result.hyperlinks.filter(a=>
    a.href.startsWith("http://tappedout.net/mtg-decks/")
    &&!a.href.startsWith("http://tappedout.net/mtg-decks/list-multiplayer-edh-generals-by-tier")
    &&!a.href.startsWith("http://tappedout.net/mtg-decks/search/"))
    .slice(0,TIER_SIZES.reduce((pv, cv) => pv+cv, 0));
    fs.writeFile(DECKLIST_LINKS_FILE,JSON.stringify(decklistLinks));
    //indexDecklists(decklistLinks);
   }
  );
  */
 }
}

module.exports = buildIndexReddit;

function indexDecklists(deckLinks)
{
 //console.log(links);
 const index = new MultiMap();
 const promises = [];
 const decklists = {};
 let tier = 0;
 let deckNr=0;
 for(const deckLink of deckLinks)
 {
  const deckUrl = deckLink.href;
  let deckName = deckLink.text;
  if(!deckName||!deckName.trim())
  {
   console.warn(`No deck name for ${deckUrl}, skipping.`);
   continue;
  }
  deckName=deckName.trim().replace("\n","");
  deckNr++;
  if(deckNr>TIER_SIZES[tier])
  {
   tier++;
   deckNr=0;
  }
  decklists[deckUrl] = {"name":deckName,"tier":TIER_NAMES[tier]};
  promises.push(new Promise((resolve,reject)=>
  {
   ineed.collect.hyperlinks.from(deckUrl,(err,response,result)=>
   {
    // quick, dirty and hopefully mostly correct way to extract only the cards belonging to a 100 card commander deck, not the ones being discussed afterwards
    cards = result.hyperlinks.filter(a=>a.href.startsWith("http://tappedout.net/mtg-card/")).slice(0,100);
    for(const cardName of cards.map(card=>card.text))
    {
     const decks = index.get(cardName);
     decks.push(deckUrl);
     // remove duplicates, that somehow end up there
     index.set(cardName,[...new Set(decks)]);
    }
    resolve();
   });
  }));
  // going by the tier sizes alone isn't enough, because some tier 3 lists don't have decklists
  // so we put in an additional stopping point to avoid getting some related decklists that don't belong
  if(deckName==="http://tappedout.net/mtg-decks/zedryou-zedwhat/")
  {
   console.log("End of tier 3, finished.");
   break;
  }
 }
 Promise.all(promises).then(()=>{
  //console.log(index.get("Brainstorm"));
  fs.writeFileSync(INDEX_FILE,"var indexMap = new Map("+JSON.stringify(index,null,2)+");");
  fs.writeFileSync(DECKLIST_FILE,"var decklists = "+JSON.stringify(decklists,null,2)+";");
 });
}
