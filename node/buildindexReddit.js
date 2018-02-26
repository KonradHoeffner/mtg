/**
Builds the index of the Competitive EDH Decklist Conglomerate on Reddit by the Lab Maniacs
@module */
module.exports = buildIndexReddit;

/* We need DOM parsing so we can't use ineed like for the tier list but instead we use request-promise.*/

const fs = require('fs');
const ineed = require('ineed');
const MultiMap = require("collections/multi-map");

const rp = require('request-promise');
const cheerio = require('cheerio');

const TIER_LIST_URL = "https://www.reddit.com/r/LabManiacs/comments/5si9gw/competitive_edh_decklist_conglomerate/";
const COMMENT = "/r/LabManiacs/comments/5si9gw/competitive_edh_decklist_conglomerate/";
const DECKLIST_LINKS_FILE = "cache/decklistlinksReddit.json";
const INDEX_FILE = "cache/indexReddit.js";
const DECKLIST_FILE = "cache/decklistsReddit.js";
const TAPPEDOUT_PREFIX = "http://tappedout.net/mtg-decks/";

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
/*
if(fs.existsSync(DECKLIST_LINKS_FILE))
 {
  console.log("Loading decklists from cache");
  decklists = JSON.parse(fs.readFileSync(DECKLIST_LINKS_FILE, 'utf8'));
  indexDecklists(decklistLinks);
 } else
*/
 {
   rp(options)
  .then(($) =>
  {
   const conglomerate = $('div.usertext-body,may-blank-within,md-container').eq(1);
   const decklists = {};
   conglomerate.find('ul').each((i,ul)=>
   {
    $(ul).find('li').each((j,li)=>
    {    
    const cli = $(li);
    let tier = 2;
    if(cli.find('em').length>0) {tier=3;} // <em>experimental</em>
    if(cli.find('strong').length>0) {tier=1;}
    cli.find('a').each((k,a)=>
    {
     const ca = $(a);
     const link = ca.attr('href');
     if(link&&link.startsWith(TAPPEDOUT_PREFIX))
     {
      const name = ca.text().replace(/[,.] By: .*/,'');
      decklists[link] = {"name":name,"tier":tier};
     }
    });
   });
   });
   if(Object.keys(decklists).length===0)
   {
    console.log("No decklists found. Aborting. Possibly wrong URL or changed format.");
    return;
   }
   indexDecklists(decklists);
  })
  .catch((err) => {console.log(err);});
 }
}


function indexDecklists(decklists)
{
 const index = new MultiMap();
 const promises = [];
 for(let deckUrl in decklists)
 {
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
 }
 console.log(JSON.stringify(decklists,null,2));
 Promise.all(promises).then(()=>{
  fs.writeFileSync(INDEX_FILE,"var indexMapReddit = new Map("+JSON.stringify(index,null,2)+");");
  fs.writeFileSync(DECKLIST_FILE,"var decklistsReddit = "+JSON.stringify(decklists,null,2)+";");
 });
}

