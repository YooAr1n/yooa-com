import Decimal from "./break_eternity.js";
import { hasUpgrade, upgradeEffect } from "./mainFuncs.js";

export const songs = {
    albums: {
        OHMYGIRL: {
            album: "OH MY GIRL",
            lengthPerSong: 10, // seconds
            moneyPerMiracleSong() {
                return new Decimal(0.0004).times(upgradeEffect("Fandom", 15));
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return hasUpgrade("Arinium", 31)
            },
            autoCost: new Decimal(100),
            unlockCost: Decimal.dZero, // already unlocked
            songs: {
                1: {
                    name: "OH MY GIRL!",
                },
                2: {
                    name: "CUPID",
                },
                3: {
                    name: "HOT SUMMER NIGHTS",
                },
                4: {
                    name: "CURIOUS",
                }
            }
        },
        CLOSER: {
            album: "CLOSER",
            lengthPerSong: 30, // seconds
            moneyPerMiracleSong() {
                return new Decimal(0.01).times(upgradeEffect("Fandom", 21));
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return hasUpgrade("OMG", 46)
            },
            autoCost: new Decimal(1e5),
            unlockCost: new Decimal(1e4), // $10,000 to unlock
            songs: {
                1: {
                    name: "CLOSER",
                },
                2: {
                    name: "SAY NO MORE",
                },
                3: {
                    name: "PLAYGROUND",
                },
                4: {
                    name: "SUGAR BABY",
                },
                5: {
                    name: "ROUND ABOUT",
                }
            }
        },
        PINKOCEAN: {
            album: "PINK OCEAN",
            lengthPerSong: 60, // seconds
            moneyPerMiracleSong() {
                return new Decimal(0.5);
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return false
            },
            autoCost: new Decimal(3e6),
            unlockCost: new Decimal(1e6), // $1,000,000 to unlock
            songs: {
                1: {
                    name: "LIAR LIAR",
                },
                2: {
                    name: "B612",
                },
                3: {
                    name: "I FOUND LOVE",
                },
                4: {
                    name: "KNOCK KNOCK",
                },
                5: {
                    name: "STEP BY STEP",
                }
            }
        },
        LISTENTOMYWORD: {
            album: "LISTEN TO MY WORD",
            lengthPerSong: 120, // seconds
            moneyPerMiracleSong() {
                return new Decimal(5);
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return false
            },
            autoCost: new Decimal(3e8),
            unlockCost: new Decimal(1e8), // $100,000,000 to unlock
            songs: {
                1: {
                    name: "LISTEN TO MY WORD (A-ing)",
                },
                2: {
                    name: "Midsummer Night's Christmas",
                },
                3: {
                    name: "Je T'aime",
                },
                4: {
                    name: "Lies You Can See",
                }
            }
        },
        COLORINGBOOK: {
            album: "COLORING BOOK",
            lengthPerSong: 180, // seconds
            moneyPerMiracleSong() {
                return new Decimal(20);
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return false
            },
            autoCost: new Decimal(3e9),
            unlockCost: new Decimal(1e9), // $1,000,000,000 to unlock
            songs: {
                1: {
                    name: "Coloring Book",
                },
                2: {
                    name: "Real World",
                },
                3: {
                    name: "Agit",
                },
                4: {
                    name: "In My Dreams",
                },
                5: {
                    name: "Perfect Day",
                }
            }
        },
        SECRETGARDEN: {
            album: "SECRET GARDEN",
            lengthPerSong: 300, // seconds
            moneyPerMiracleSong() {
                return new Decimal(200);
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return false
            },
            autoCost: new Decimal(3e10),
            unlockCost: new Decimal(1e10), // $10,000,000,000 to unlock
            songs: {
                1: {
                    name: "Secret Garden",
                },
                2: {
                    name: "Love O'clock",
                },
                3: {
                    name: "Butterfly",
                },
                4: {
                    name: "Sixteen",
                },
                5: {
                    name: "Magic",
                }
            }
        },
        REMEMBERME: {
            album: "REMEMBER ME",
            lengthPerSong: 500, // seconds
            moneyPerMiracleSong() {
                return new Decimal(1000);
            },
            isBackStreamable() {// can be streamed in background (streamable without it being the current album)
                return false
            },
            autoCost: new Decimal(3e11),
            unlockCost: new Decimal(1e11),
            songs: {
                1: {
                    name: "Remember Me",
                },
                2: {
                    name: "Echo",
                },
                3: {
                    name: "Twilight",
                },
                4: {
                    name: "Illusion",
                },
                5: {
                    name: "Our Story",
                }
            }
        }
    }
}