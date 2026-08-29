# Page Pointer demo

Open [the direct demo route](/demo) or `/?demo=1`. It immediately opens the
sample guide over **The Small Red Kite**, a three-line reading view with word
and line controls.

The persistent banner says **Demo — sample data, nothing is saved** and offers:

- **Reset demo** — deletes the `demo:page-pointer` IndexedDB database and starts
  the sample again.
- **Start for real** — deletes the demo database, then leaves `/demo` for `/`.

Demo preferences and any short sample session summary use only the
`demo:page-pointer` IndexedDB namespace. Real reading data uses
`page-pointer`; the two are never opened together and demo data is discarded
when real mode starts. The demo has no account or billing calls and is
available after the first visit while offline.
