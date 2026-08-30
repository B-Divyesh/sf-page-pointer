# Copy audit — 2026-08-30

Scope: every complete sentence a visitor can see on the landing page,
including demo content and dynamic status or error text. Button labels,
instrument readouts, and short section labels are listed separately. Words are
counted as whitespace-delimited tokens containing at least one letter or
number. Hyphenated terms count as one word; standalone punctuation does not.

## Landing page: static sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Demo — sample data, nothing is saved. | 6 | Pass |
| Try the guide without using your reading data. | 8 | Pass |
| Keep emerging readers on the right word. | 7 | Pass |
| For parents, tutors, and emerging readers, it marks the current word on a physical book. | 15 | Pass |
| Opens the sample guide with a short story. | 8 | Pass |
| Frames stay on this device. | 5 | Pass |
| No account needed. | 3 | Pass |
| Works offline after its first visit. | 6 | Pass |
| An open illustrated book and phone are arranged on a cyan drafting mat. | 13 | Pass |
| A yellow guide crosses the phone screen. | 7 | Pass |
| Hold the phone steady above the page, then tap the word being read. | 13 | Pass |
| Camera view. | 2 | Pass |
| Tap or press Enter to place the reading guide. | 9 | Pass |
| The kite danced above the hill. | 6 | Pass |
| Mina held the string and smiled. | 6 | Pass |
| Up, up, it climbed into the blue. | 7 | Pass |
| Ready to place. | 3 | Pass |
| Tap a printed word. | 4 | Pass |
| Hold the rear camera above the page. | 7 | Pass |
| Turn the phone sideways before you aim. | 7 | Pass |
| Touch the word being read. | 5 | Pass |
| Page Pointer finds the nearest ink line—without reading it. | 9 | Pass |
| Use Next or the arrow keys to travel word by word. | 11 | Pass |
| Switch to a full-line guide anytime. | 6 | Pass |
| Flatten the page, reduce glare, move away from illustrations, and tap again. | 12 | Pass |
| You can also use Previous and Next. | 7 | Pass |
| The app checks each camera frame in memory, then discards it. | 11 | Pass |
| It never reads, uploads, or stores the book’s words. | 9 | Pass |
| Preferences and brief session summaries stay in this browser. | 9 | Pass |
| Export, import, or erase them whenever you like. | 8 | Pass |
| The complete reading guide stays free. | 6 | Pass |
| One purchase adds saved guide colors and a ten-minute session timer. | 11 | Pass |
| Checkout opens on Sociobot. | 4 | Pass |
| No account needed. | 3 | Pass |
| An app update is ready. | 5 | Pass |
| A reading guide for shared physical books. | 7 | Pass |

## Landing page: dynamic states

| Copy | Words | Result |
| --- | ---: | --- |
| Word guide placed. | 3 | Pass |
| Line guide placed. | 3 | Pass |
| Use Next when the reader moves. | 6 | Pass |
| Low contrast—tap again if this missed. | 6 | Pass |
| No clear line found. | 4 | Pass |
| Move closer, reduce glare, and tap the printed words again. | 10 | Pass |
| Waiting for camera permission… | 4 | Pass |
| This browser cannot open a camera. | 6 | Pass |
| Try the sample guide, or open Page Pointer in a current mobile browser. | 13 | Pass |
| Camera access is off. | 4 | Pass |
| Allow it in your browser's site settings, then try again—or try the sample guide. | 14 | Pass |
| The rear camera did not open. | 6 | Pass |
| Close other camera apps and try again, or try the sample guide. | 12 | Pass |
| End of detected text. | 4 | Pass |
| Start of detected text. | 4 | Pass |
| Turn the page or tap the next line. | 8 | Pass |
| Timer stopped. | 2 | Pass |
| Ten minutes complete. | 3 | Pass |
| Export downloaded. | 2 | Pass |
| Local data imported. | 3 | Pass |
| This is not a Page Pointer export. | 7 | Pass |
| This export is incomplete or damaged. | 6 | Pass |
| Import failed. | 2 | Pass |
| Erase preferences and session summaries stored by Page Pointer on this device? | 12 | Pass |
| Your license will not be removed. | 6 | Pass |
| Local reading data erased. | 4 | Pass |
| Supporter pack active on this device. | 6 | Pass |
| Paste the license token from your receipt. | 7 | Pass |
| Checking this license… | 3 | Pass |
| Purchase restored. | 2 | Pass |
| The Supporter pack is active. | 5 | Pass |
| This license is not active. | 5 | Pass |
| Check the token or buy the pack. | 7 | Pass |
| Could not check the license. | 5 | Pass |
| Wait a few seconds, then try again. | 7 | Pass |
| Could not check while offline. | 5 | Pass |
| Reconnect and try again. | 4 | Pass |
| Purchase verified. | 2 | Pass |
| License no longer active. | 4 | Pass |
| You can purchase again below. | 5 | Pass |
| Offline: using the last valid license check. | 7 | Pass |
| Close other Page Pointer demo tabs before resetting the demo. | 10 | Pass |
| The demo could not reset. | 5 | Pass |
| Reload and try again. | 4 | Pass |
| The demo could not close. | 5 | Pass |

## Labels and readouts

These fragments are direct names or states, not marketing sentences: **Camera
reading guide**, **Open camera**, **Try it with sample data**, **Setup**,
**Place the guide**, **Close guide**, **Rear camera**, **Sample guide · local**,
**Frame stays local**, **Word**, **Line**, **Previous**, **Next**, **Supporter
pack**, **Saved guide color**, **Start 10-minute timer**, **How it
works**, **Three steps**, **Aim the rear camera**, **Tap the current word**,
**Follow with Next**, **Limits**, **Local
data**, **Local data settings**, **Export JSON**, **Import JSON**, **Erase
local data**, **Optional Supporter pack · one-time**, **Privacy**, **Terms**,
**Buy once for ₹249 on Sociobot (opens checkout)**, **Restore Supporter pack**, **Ready offline**,
**Offline · guide ready**, **Install app**, **Install update**, and
coordinate/timer readouts.

No audited sentence exceeds 22 words. None uses the banned marketing words.
`tests/release-config.test.ts` derives every table count with the stated rule
and confirms that the audited text still occurs in the product source.
The first screen states the job, audience, first action, demo result, privacy,
account requirement, and offline behavior in one screen at 390 px.

## Terminology

| Concept | One term used |
| --- | --- |
| Isolated trial mode | demo |
| Built-in trial content | sample guide |
| Visual reading marker | guide |
| Reading material | physical book |
| Automatic pixel analysis | detection |
| Browser-stored information | local data |
| Brief usage record | session summary |
| Paid add-on | Supporter pack |
| Countdown | timer |
| Purchase proof | license |
