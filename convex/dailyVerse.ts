import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Book name mapping: English to API abbreviation
const BOOK_ABBREVIATIONS: Record<string, string> = {
  // Old Testament
  "genesis": "GEN", "gen": "GEN",
  "exodus": "EXO", "exod": "EXO", "ex": "EXO",
  "leviticus": "LEV", "lev": "LEV",
  "numbers": "NUM", "num": "NUM",
  "deuteronomy": "DEU", "deut": "DEU",
  "joshua": "JOS", "josh": "JOS",
  "judges": "JDG", "judg": "JDG",
  "ruth": "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1 sam": "1SA", "1sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2 sam": "2SA", "2sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1 kgs": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2 kgs": "2KI",
  "1 chronicles": "1CH", "1chronicles": "1CH", "1 chr": "1CH",
  "2 chronicles": "2CH", "2chronicles": "2CH", "2 chr": "2CH",
  "ezra": "EZR",
  "nehemiah": "NEH", "neh": "NEH",
  "esther": "EST", "esth": "EST",
  "job": "JOB",
  "psalms": "PSA", "psalm": "PSA", "ps": "PSA", "psa": "PSA",
  "proverbs": "PRO", "prov": "PRO",
  "ecclesiastes": "ECC", "eccl": "ECC",
  "song of solomon": "SNG", "song of songs": "SNG", "songs": "SNG", "song": "SNG",
  "isaiah": "ISA", "isa": "ISA",
  "jeremiah": "JER", "jer": "JER",
  "lamentations": "LAM", "lam": "LAM",
  "ezekiel": "EZK", "ezek": "EZK",
  "daniel": "DAN", "dan": "DAN",
  "hosea": "HOS", "hos": "HOS",
  "joel": "JOL",
  "amos": "AMO",
  "obadiah": "OBA", "obad": "OBA",
  "jonah": "JON",
  "micah": "MIC", "mic": "MIC",
  "nahum": "NAM", "nah": "NAM",
  "habakkuk": "HAB", "hab": "HAB",
  "zephaniah": "ZEP", "zeph": "ZEP",
  "haggai": "HAG", "hag": "HAG",
  "zechariah": "ZEC", "zech": "ZEC",
  "malachi": "MAL", "mal": "MAL",
  // New Testament
  "matthew": "MAT", "matt": "MAT", "mt": "MAT",
  "mark": "MRK", "mk": "MRK",
  "luke": "LUK", "lk": "LUK",
  "john": "JHN", "jn": "JHN",
  "acts": "ACT",
  "romans": "ROM", "rom": "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO", "1 cor": "1CO", "1cor": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO", "2 cor": "2CO", "2cor": "2CO",
  "galatians": "GAL", "gal": "GAL",
  "ephesians": "EPH", "eph": "EPH",
  "philippians": "PHP", "phil": "PHP",
  "colossians": "COL", "col": "COL",
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1 thess": "1TH",
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2 thess": "2TH",
  "1 timothy": "1TI", "1timothy": "1TI", "1 tim": "1TI",
  "2 timothy": "2TI", "2timothy": "2TI", "2 tim": "2TI",
  "titus": "TIT",
  "philemon": "PHM", "phlm": "PHM",
  "hebrews": "HEB", "heb": "HEB",
  "james": "JAS", "jas": "JAS",
  "1 peter": "1PE", "1peter": "1PE", "1 pet": "1PE",
  "2 peter": "2PE", "2peter": "2PE", "2 pet": "2PE",
  "1 john": "1JN", "1john": "1JN",
  "2 john": "2JN", "2john": "2JN",
  "3 john": "3JN", "3john": "3JN",
  "jude": "JUD",
  "revelation": "REV", "rev": "REV",
};

// Chinese book names
const CHINESE_BOOK_NAMES: Record<string, string> = {
  "GEN": "創世記", "EXO": "出埃及記", "LEV": "利未記", "NUM": "民數記",
  "DEU": "申命記", "JOS": "約書亞記", "JDG": "士師記", "RUT": "路得記",
  "1SA": "撒母耳記上", "2SA": "撒母耳記下", "1KI": "列王紀上", "2KI": "列王紀下",
  "1CH": "歷代志上", "2CH": "歷代志下", "EZR": "以斯拉記", "NEH": "尼希米記",
  "EST": "以斯帖記", "JOB": "約伯記", "PSA": "詩篇", "PRO": "箴言",
  "ECC": "傳道書", "SNG": "雅歌", "ISA": "以賽亞書", "JER": "耶利米書",
  "LAM": "耶利米哀歌", "EZK": "以西結書", "DAN": "但以理書", "HOS": "何西阿書",
  "JOL": "約珥書", "AMO": "阿摩司書", "OBA": "俄巴底亞書", "JON": "約拿書",
  "MIC": "彌迦書", "NAM": "那鴻書", "HAB": "哈巴谷書", "ZEP": "西番雅書",
  "HAG": "哈該書", "ZEC": "撒迦利亞書", "MAL": "瑪拉基書",
  "MAT": "馬太福音", "MRK": "馬可福音", "LUK": "路加福音", "JHN": "約翰福音",
  "ACT": "使徒行傳", "ROM": "羅馬書", "1CO": "哥林多前書", "2CO": "哥林多後書",
  "GAL": "加拉太書", "EPH": "以弗所書", "PHP": "腓立比書", "COL": "歌羅西書",
  "1TH": "帖撒羅尼迦前書", "2TH": "帖撒羅尼迦後書", "1TI": "提摩太前書",
  "2TI": "提摩太後書", "TIT": "提多書", "PHM": "腓利門書", "HEB": "希伯來書",
  "JAS": "雅各書", "1PE": "彼得前書", "2PE": "彼得後書", "1JN": "約翰一書",
  "2JN": "約翰二書", "3JN": "約翰三書", "JUD": "猶大書", "REV": "啟示錄",
};

/**
 * Get the daily verse from database
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    
    const verse = await ctx.db
      .query("dailyVerse")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    
    return verse;
  },
});

/**
 * Internal mutation to save the verse (called by action)
 */
export const saveVerse = internalMutation({
  args: {
    date: v.string(),
    text: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete all existing verses (we only keep one)
    const existingVerses = await ctx.db.query("dailyVerse").collect();
    for (const verse of existingVerses) {
      await ctx.db.delete(verse._id);
    }
    
    // Insert new verse
    await ctx.db.insert("dailyVerse", {
      date: args.date,
      text: args.text,
      reference: args.reference,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Parse verse reference like "John 3:16" or "1 Corinthians 13:4-7"
 */
function parseReference(reference: string): { book: string; chapter: number; verses: number[] } | null {
  // Handle formats like "John 3:16", "1 Corinthians 13:4-7", "Psalm 23:1"
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  
  const bookName = match[1].toLowerCase().trim();
  const chapter = parseInt(match[2], 10);
  const startVerse = parseInt(match[3], 10);
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;
  
  const bookAbbr = BOOK_ABBREVIATIONS[bookName];
  if (!bookAbbr) return null;
  
  const verses: number[] = [];
  for (let v = startVerse; v <= endVerse; v++) {
    verses.push(v);
  }
  
  return { book: bookAbbr, chapter, verses };
}

/**
 * Action to fetch verse from APIs and save to database
 */
export const refreshVerse = action({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    
    try {
      // Step 1: Get verse reference from OurManna API
      const mannaResponse = await fetch(
        "https://beta.ourmanna.com/api/v1/get?format=json&order=daily"
      );
      if (!mannaResponse.ok) {
        throw new Error("Failed to fetch from OurManna API");
      }
      
      const mannaData = await mannaResponse.json();
      const reference = mannaData.verse?.details?.reference;
      if (!reference) {
        throw new Error("No reference in OurManna response");
      }
      
      // Step 2: Parse the reference
      const parsed = parseReference(reference);
      if (!parsed) {
        // Fallback: use the English text if we can't parse the reference
        const text = mannaData.verse?.details?.text || "";
        await ctx.runMutation(internal.dailyVerse.saveVerse, {
          date: today,
          text,
          reference,
        });
        return { success: true, fallback: true };
      }
      
      // Step 3: Fetch Chinese translation from HelloAO API
      const chineseResponse = await fetch(
        `https://bible.helloao.org/api/cmn_cuv/${parsed.book}/${parsed.chapter}.json`
      );
      
      let verseText: string;
      let chineseReference: string;
      
      if (chineseResponse.ok) {
        const chineseData = await chineseResponse.json();
        
        // Extract verse texts - the API returns chapter content with verses
        const verseTexts: string[] = [];
        for (const verseNum of parsed.verses) {
          // The content structure may vary, try to find the verse
          const content = chineseData.chapter?.content || chineseData.content || [];
          for (const item of content) {
            if (item.type === "verse" && item.number === verseNum) {
              // Verse content can be string or array of objects/strings
              if (typeof item.content === "string") {
                verseTexts.push(item.content);
              } else if (Array.isArray(item.content)) {
                const text = item.content
                  .map((c: any) => {
                    if (typeof c === "string") return c;
                    return c?.text || "";
                  })
                  .join("");
                verseTexts.push(text);
              }
              break;
            }
          }
        }
        
        verseText = verseTexts.join(" ");
        const chineseBook = CHINESE_BOOK_NAMES[parsed.book] || reference.split(" ")[0];
        const verseRange = parsed.verses.length > 1 
          ? `${parsed.verses[0]}-${parsed.verses[parsed.verses.length - 1]}`
          : `${parsed.verses[0]}`;
        chineseReference = `${chineseBook} ${parsed.chapter}:${verseRange}`;
      } else {
        // Fallback to English if Chinese API fails
        verseText = mannaData.verse?.details?.text || "";
        chineseReference = reference;
      }
      
      // Step 4: Save to database
      await ctx.runMutation(internal.dailyVerse.saveVerse, {
        date: today,
        text: verseText || mannaData.verse?.details?.text || "",
        reference: chineseReference,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error refreshing daily verse:", error);
      throw error;
    }
  },
});

