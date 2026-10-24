# Persona Spectrum / 人格光谱

A buildless Chinese personality exploration site with 110 questions, sixteen type reports, original-copy content, and bundled SVG illustrations.

## Run locally

Live website: https://kimura6341.github.io/MBTI/

GitHub Pages publishes `dist/` through `.github/workflows/pages.yml` after checks pass on pushes to `main`. It can also be run manually from the Actions tab.

Requires Node.js 22 or later. No npm installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Deploy `dist/` as a static website. The `#reference-preview` hash opens the sample report and lets you switch between 16 types and A/T variants.

## Check and build

```sh
npm test
npm run build:offline
```

The default offline output is `../../outputs/persona-lab/`. To choose another folder, set `PERSONA_OFFLINE_DIR` before building. The HTML embeds all content, scripts, styles, and 32 SVG assets and can be opened without a server.

## Edit report content and images

The homepage is a separate landing view modeled on the owner-authorized reference homepage, with desktop/mobile camping illustrations. `dist/home.mjs` and `dist/home.css` own its structure and layout. It uses this questionnaire's real counts rather than copying the reference site's traffic or accuracy statistics. The test remains available at `#test`; report samples and type previews stay separate from personal answers.

Homepage SVG sources are documented in `dist/assets/home/sources.json`. Run `python build-home-assets.py` after replacing those assets.

- `content/type-copy.md`: the user-maintained sixteen-type introduction text.
- `python sync-type-copy.py`: imports that text into `dist/user-type-copy.mjs`.
- `dist/assets/personality/`: the 32 source SVGs and their source manifest.
- `python build-type-images.py`: rebuilds the embedded image module from those files.
- `dist/chapter-art.mjs`: growth and relationship illustrations.
- `dist/report.mjs`, `dist/type-stories.mjs`: scoring-dependent narratives and chapter material.

Python helper scripts use only the standard library. Rebuild the offline HTML after changing content or assets.

## Data and email capture

Answers remain in browser localStorage. Download buttons require a valid email before downloading the text report. Email, type code, sample flag, and timestamp are saved only in that browser under `persona-spectrum-report-emails`. There is no backend collection, outbound email, subscription, or analytics integration. Resetting local progress also removes saved email records.

## Scoring

60 original exploration questions and 50 adapted IPIP Big-Five Factor Markers questions are interleaved but scored independently. IPIP answers do not change the four-letter type. Percentages show scale positions, not population percentiles or accuracy. This questionnaire and its Chinese adaptation have not been psychometrically validated and do not implement the proprietary 16Personalities or official MBTI scoring algorithm.

IPIP sources:

- https://www.ipip.ori.org/New_IPIP-50-item-scale.htm
- https://ipip.ori.org/newBigFive5broadKey.htm
- https://ipip.ori.org/newPermission.htm

Original-copy and illustration assets were supplied or collected under the project owner's authorization. Their provenance is retained in the content file and asset manifest.
