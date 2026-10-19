<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT TITLE BLOCK -->
<br />
<div align="center">
  <a href="https://github.com/Elouahabi-Naoufal/obsidian-folder-focus">
    <h3 align="center">Folder Focus</h3>
  </a>

  <p align="center">
    An Obsidian plugin that hides folders in the file explorer so the ones you are working in stay visible.
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/obsidian-folder-focus"><strong>Explore the source »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Folder Focus is a small Obsidian plugin that hides selected folders from the file explorer. Hiding is
presentational only — nothing is moved, renamed or deleted on disk, and unhiding restores the folder
immediately.

The plugin registers seven folder-management commands, plus a debug command:

| Command | What it does |
|---------|--------------|
| Hide all folders | Marks every folder in the vault as hidden |
| Unhide all folders | Clears the hidden list |
| Hide specific folder | Searchable single-folder picker |
| Unhide specific folder | Searchable picker limited to currently hidden folders |
| Keep specific folder | Hides every folder except the one you pick |
| Bulk hide folders | Multi-select picker with checkboxes |
| Bulk keep folders | Hides everything except the selected folders |

There is also a **Debug: list all folder paths in console** command for inspecting what Obsidian reports
as a folder path.

Behaviour you should know about:

* The hidden list is stored in the plugin's `data.json` as vault-relative paths.
* A `MutationObserver` re-applies the hiding when the file explorer DOM changes — expanding a folder,
  scrolling, renaming or creating a folder — so hidden folders do not reappear as you navigate.
* The setting tab lists every hidden folder with an individual **Unhide** button and an **Unhide all**
  button.
* Unloading the plugin removes every `ff-hidden` marker and restores the explorer.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Obsidian][Obsidian.com]][Obsidian-url]
* [![JavaScript][JavaScript.com]][JavaScript-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Obsidian 0.15.0 or newer — the `minAppVersion` declared in `manifest.json`.
* There is no build step. `main.js` is the shipped plugin file.

### Installation

**From a release**

1. Download `main.js` and `manifest.json` from the latest GitHub release.
2. Create `<vault>/.obsidian/plugins/naoufal-folder-focus/`.
3. Copy both files into that folder.
4. Reload Obsidian, then enable **Folder Focus** under **Settings → Community plugins**.

**From source**

```sh
git clone https://github.com/Elouahabi-Naoufal/obsidian-folder-focus.git
cd obsidian-folder-focus
```

Copy `main.js` and `manifest.json` into `<vault>/.obsidian/plugins/naoufal-folder-focus/` and reload
Obsidian. `src/main.js` and `main.js` are currently identical, so editing either one has the same effect
after a reload.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. Open the command palette (`Ctrl/Cmd+P`).
2. Run **Folder Focus: Hide specific folder** and pick a folder from the searchable list.
3. The folder disappears from the file explorer. Repeat for other folders, or use **Bulk hide folders**
   to select several at once.
4. To restore everything, run **Unhide all folders**. To restore one folder, run **Unhide specific
   folder** or use the Unhide button in **Settings → Folder Focus**.

A typical workflow is **Keep specific folder**: run it, pick the course or project you are currently
working on, and every other folder is hidden until you clear the list.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

Working today:

- [x] Hide all / unhide all
- [x] Hide and unhide a single folder through a searchable picker
- [x] Keep only a selected folder
- [x] Bulk hide / bulk keep with checkboxes
- [x] Settings tab listing hidden folders
- [x] Re-apply hiding after DOM changes, renames and folder creation

Open items visible in the code:

- [ ] Hiding relies on `:has()` selectors in the file explorer DOM; a future Obsidian UI change could
      break the selectors, and there is no fallback besides the debug command
- [ ] The settings tab only lists hidden folders; it does not offer a folder picker of its own
- [ ] No automated tests
- [ ] No `versions.json`, so release/version tooling is manual

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create.
Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You
can also simply open an issue with the tag "enhancement". Don't forget to give the project a star!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please test in a throwaway vault: copy the plugin into `.obsidian/plugins/naoufal-folder-focus/`, reload,
and exercise the command you touched. The folder-path matching is the fragile part, so check nested
folders and folders with spaces in their names.

### Top contributors:

<a href="https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Elouahabi-Naoufal/obsidian-folder-focus" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Naoufal Elouahabi - [LinkedIn](https://www.linkedin.com/in/elouahabi-naoufal/) - elouahabi-naoufal1@gmail.com

Project Link: [https://github.com/Elouahabi-Naoufal/obsidian-folder-focus](https://github.com/Elouahabi-Naoufal/obsidian-folder-focus)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Obsidian](https://obsidian.md/) and the [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
* [Img Shields](https://shields.io)
* [Choose an Open Source License](https://choosealicense.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Elouahabi-Naoufal/obsidian-folder-focus.svg?style=for-the-badge
[contributors-url]: https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Elouahabi-Naoufal/obsidian-folder-focus.svg?style=for-the-badge
[forks-url]: https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/network/members
[stars-shield]: https://img.shields.io/github/stars/Elouahabi-Naoufal/obsidian-folder-focus.svg?style=for-the-badge
[stars-url]: https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/stargazers
[issues-shield]: https://img.shields.io/github/issues/Elouahabi-Naoufal/obsidian-folder-focus.svg?style=for-the-badge
[issues-url]: https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/issues
[license-shield]: https://img.shields.io/github/license/Elouahabi-Naoufal/obsidian-folder-focus.svg?style=for-the-badge
[license-url]: https://github.com/Elouahabi-Naoufal/obsidian-folder-focus/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/elouahabi-naoufal/
[Obsidian.com]: https://img.shields.io/badge/Obsidian-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white
[Obsidian-url]: https://obsidian.md/
[JavaScript.com]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
