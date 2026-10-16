"""Validate static site contracts without installing dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.elements = []
        self.ids = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.elements.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])


class SiteContracts(unittest.TestCase):
    def setUp(self):
        self.pages = {name: Document(ROOT / name) for name in ['index.html', 'resume.html']}

    def test_internal_assets_and_links_resolve(self):
        for name, doc in self.pages.items():
            for tag, attrs in doc.elements:
                for attribute in ['src', 'href', 'poster']:
                    value = attrs.get(attribute)
                    if not value:
                        continue
                    url = urlsplit(value)
                    if url.scheme or url.netloc:
                        continue
                    target = ROOT / unquote(url.path) if url.path else ROOT / name
                    self.assertTrue(target.is_file(), f'{name}: missing {attribute}={value}')
                    if url.fragment and target.suffix == '.html':
                        self.assertIn(url.fragment, Document(target).ids, f'{name}: broken anchor {value}')

    def test_ids_are_unique(self):
        for name, doc in self.pages.items():
            self.assertEqual(len(doc.ids), len(set(doc.ids)), name)

    def test_project_dialogs_exist(self):
        doc = self.pages['index.html']
        projects = [attrs for _, attrs in doc.elements if 'data-category' in attrs]
        self.assertEqual(len(projects), 11)
        for _, attrs in doc.elements:
            if 'data-modal' in attrs:
                self.assertIn(attrs['data-modal'], doc.ids)
        dialogs = [attrs for _, attrs in doc.elements if attrs.get('role') == 'dialog']
        self.assertEqual(len(dialogs), 11)
        self.assertTrue(all(attrs.get('aria-modal') == 'true' for attrs in dialogs))

    def test_images_have_alt_text_and_videos_are_deferred(self):
        for doc in self.pages.values():
            for tag, attrs in doc.elements:
                if tag == 'img':
                    self.assertTrue(attrs.get('alt'), attrs)
                if tag == 'video':
                    self.assertEqual(attrs.get('preload'), 'none')
                    self.assertNotIn('autoplay', attrs)

    def test_page_is_not_dependent_on_remote_scripts(self):
        for doc in self.pages.values():
            for tag, attrs in doc.elements:
                if tag == 'script':
                    self.assertFalse(urlsplit(attrs.get('src', '')).scheme)

    def test_current_resume_and_original_documents_are_available(self):
        current = (ROOT / 'resume.html').read_text()
        for content in ['AUDI AG', '32 PB', 'CLIP', 'AKKODIS', 'PPO', 'SAC', 'TD3', 'Aero-XRL', 'Nouri', 'Scope', 'EXIST', 'Master’s studies', 'Earlier documents:']:
            self.assertIn(content, current)
        self.assertTrue((ROOT / 'CV_Kshitij_Prasad.pdf').is_file())
        self.assertTrue((ROOT / 'Resume_KshitijPrasad.pdf').is_file())


if __name__ == '__main__':
    unittest.main(verbosity=2)
