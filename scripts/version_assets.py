"""Refresh browser asset revisions after editing local styles or modules."""
from hashlib import sha256
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def revision(asset):
    return sha256((ROOT / asset).read_bytes()).hexdigest()[:10]


module = ROOT / 'js/portfolio.js'
module.write_text(re.sub(
    r"import\('\./trajectory-view.js(?:\?v=[a-f0-9]+)?'\)",
    "import('./trajectory-view.js?v=" + revision('js/trajectory-view.js') + "')",
    module.read_text(),
))
assets = [
    'css/fonts.css', 'css/editorial.css', 'css/cinematic.css',
    'css/experience.css', 'js/experience.js', 'js/portfolio.js',
]
for name in ['index.html', 'resume.html']:
    page = ROOT / name
    source = page.read_text()
    for asset in assets:
        source = re.sub(
            re.escape(asset) + r'(?:\?v=[a-f0-9]+)?(?=")',
            asset + '?v=' + revision(asset), source,
        )
    page.write_text(source)
print('Updated local CSS and module revisions.')
