# Locally hosted portfolio fonts

Downloaded from the official Google Fonts service on 16 October 2026. These are unmodified Latin-subset WOFF2 font files. Both families use the SIL Open Font License 1.1; the original license text is included beside the files.

## Source files

Google Fonts CSS request used to obtain the font URLs:

<https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&display=swap>

| Local file | Official source | License |
| --- | --- | --- |
| `dm-sans-latin-variable.woff2` | <https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2> | `DM-Sans-OFL.txt` |
| `instrument-serif-latin-regular.woff2` | <https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-6zUTjg.woff2> | `Instrument-Serif-OFL.txt` |
| `instrument-serif-latin-italic.woff2` | <https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zAjjH7M.woff2> | `Instrument-Serif-OFL.txt` |

Official license sources:

- <https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt>
- <https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/OFL.txt>

The Google Fonts stylesheet requests DM Sans weights 400 through 700 in one variable file. Inspection with fontTools confirms a `wght` axis from 100 to 1000, including all requested weights. Instrument Serif provides separate regular and italic files, both weight 400. Each font has the WOFF2 signature and successfully opens as WOFF2 with fontTools.

## Suggested CSS

Paths below assume a stylesheet in the portfolio's `css/` directory.

```css
@font-face {
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("../media/fonts/dm-sans-latin-variable.woff2") format("woff2");
}
@font-face {
  font-family: "Instrument Serif";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("../media/fonts/instrument-serif-latin-regular.woff2") format("woff2");
}
@font-face {
  font-family: "Instrument Serif";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url("../media/fonts/instrument-serif-latin-italic.woff2") format("woff2");
}
```

Preload the main body/heading font, with the anonymous CORS mode required for font preloads:

```html
<link rel="preload" href="media/fonts/dm-sans-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
```

The italic Instrument Serif file is also used in the visible hero; an optional second preload may help that face. The regular serif face can load on demand.

## SHA-256 checksums

```text
9fea608a947e67020c33cad9a6fe3d60c54119dfb8cff87768a8117a15ed7543  dm-sans-latin-variable.woff2
5eb09b5ac0e28b67c2f041c8ba6d244604ca0c0980d65912ab2d47fed84ddc31  instrument-serif-latin-regular.woff2
5a51946dfffa82972bc98745359c46761515641fda557c25116459a9f83da4a7  instrument-serif-latin-italic.woff2
```
