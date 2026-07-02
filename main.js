const { Plugin, Modal, Setting, Notice, PluginSettingTab, debounce } = require('obsidian');

const DEFAULT_SETTINGS = {
    hiddenFolders: []
};

// ─── Folder Picker Modal (single) ────────────────────────────────────────────
class FolderPickerModal extends Modal {
    constructor(app, folders, onChoose) {
        super(app);
        this.folders = folders;
        this.onChoose = onChoose;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h3', { text: 'Select a folder' });

        const input = contentEl.createEl('input', { type: 'text', placeholder: 'Search...' });
        input.style.cssText = 'width:100%;margin-bottom:8px;padding:6px;box-sizing:border-box;';

        const list = contentEl.createEl('div');
        list.style.cssText = 'max-height:320px;overflow-y:auto;';

        const render = (q) => {
            list.empty();
            this.folders
                .filter(f => f.toLowerCase().includes(q.toLowerCase()))
                .forEach(folder => {
                    const item = list.createEl('div', { text: folder || '/ (root)' });
                    item.style.cssText = 'padding:6px 10px;cursor:pointer;border-radius:4px;';
                    item.addEventListener('mouseenter', () => item.style.background = 'var(--interactive-hover)');
                    item.addEventListener('mouseleave', () => item.style.background = '');
                    item.addEventListener('click', () => { this.onChoose(folder); this.close(); });
                });
        };

        input.addEventListener('input', () => render(input.value));
        render('');
        setTimeout(() => input.focus(), 50);
    }

    onClose() { this.contentEl.empty(); }
}

// ─── Bulk Folder Picker Modal (multi-select) ──────────────────────────────────
class BulkFolderPickerModal extends Modal {
    constructor(app, folders, title, onConfirm) {
        super(app);
        this.folders = folders;
        this.title = title;
        this.onConfirm = onConfirm;
        this.selected = new Set();
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h3', { text: this.title });

        const input = contentEl.createEl('input', { type: 'text', placeholder: 'Search...' });
        input.style.cssText = 'width:100%;margin-bottom:8px;padding:6px;box-sizing:border-box;';

        const list = contentEl.createEl('div');
        list.style.cssText = 'max-height:300px;overflow-y:auto;margin-bottom:10px;';

        const render = (q) => {
            list.empty();
            this.folders
                .filter(f => f.toLowerCase().includes(q.toLowerCase()))
                .forEach(folder => {
                    const row = list.createEl('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 10px;cursor:pointer;border-radius:4px;';
                    row.addEventListener('mouseenter', () => row.style.background = 'var(--interactive-hover)');
                    row.addEventListener('mouseleave', () => row.style.background = '');

                    const cb = row.createEl('input', { type: 'checkbox' });
                    cb.checked = this.selected.has(folder);
                    row.createEl('span', { text: folder || '/ (root)' });

                    const toggle = () => {
                        cb.checked = !cb.checked;
                        cb.checked ? this.selected.add(folder) : this.selected.delete(folder);
                    };
                    cb.addEventListener('change', () => {
                        cb.checked ? this.selected.add(folder) : this.selected.delete(folder);
                    });
                    row.addEventListener('click', (e) => { if (e.target !== cb) toggle(); });
                });
        };

        input.addEventListener('input', () => render(input.value));
        render('');

        const btn = contentEl.createEl('button', { text: 'Confirm' });
        btn.style.cssText = 'width:100%;padding:8px;cursor:pointer;margin-top:4px;';
        btn.addEventListener('click', () => { this.onConfirm([...this.selected]); this.close(); });

        setTimeout(() => input.focus(), 50);
    }

    onClose() { this.contentEl.empty(); }
}

// ─── Main Plugin ──────────────────────────────────────────────────────────────
class FolderFocusPlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        // Debounced processor — re-applies hiding after DOM changes
        this.processFolders = debounce(() => {
            this._applyHiding();
        }, 50, false);

        // MutationObserver: re-apply whenever the file explorer DOM changes
        // (expanding folders, scrolling, renaming etc.)
        this.mutationObserver = new MutationObserver((records) => {
            const relevant = records.some(r =>
                r.target?.parentElement?.classList.contains('nav-folder') ||
                r.target?.parentElement?.classList.contains('nav-files-container') ||
                r.target?.classList?.contains('nav-files-container')
            );
            if (relevant) this.processFolders();
        });
        this.mutationObserver.observe(window.document, { childList: true, subtree: true });

        // Re-apply on rename/create
        this.registerEvent(this.app.vault.on('rename', () => {
            setTimeout(() => this.processFolders(), 50);
        }));
        this.registerEvent(this.app.vault.on('create', () => {
            setTimeout(() => this.processFolders(), 50);
        }));

        // Apply on layout ready
        this.app.workspace.onLayoutReady(() => {
            setTimeout(() => this._applyHiding(), 500);
        });

        // ── Commands ──────────────────────────────────────────────────────────

        this.addCommand({
            id: 'hide-all-folders',
            name: 'Hide all folders',
            callback: async () => {
                this.settings.hiddenFolders = this.getAllFolderPaths();
                await this.saveSettings();
                this._applyHiding();
                new Notice(`Hidden ${this.settings.hiddenFolders.length} folders`);
            }
        });

        this.addCommand({
            id: 'unhide-all-folders',
            name: 'Unhide all folders',
            callback: async () => {
                this.settings.hiddenFolders = [];
                await this.saveSettings();
                this._applyHiding();
                new Notice('All folders visible');
            }
        });

        this.addCommand({
            id: 'hide-specific-folder',
            name: 'Hide specific folder',
            callback: () => {
                const visible = this.getAllFolderPaths().filter(f => !this.settings.hiddenFolders.includes(f));
                new FolderPickerModal(this.app, visible, async (folder) => {
                    if (!this.settings.hiddenFolders.includes(folder)) {
                        this.settings.hiddenFolders.push(folder);
                        await this.saveSettings();
                        this._applyHiding();
                        new Notice(`Hidden: ${folder}`);
                    }
                }).open();
            }
        });

        this.addCommand({
            id: 'unhide-specific-folder',
            name: 'Unhide specific folder',
            callback: () => {
                if (!this.settings.hiddenFolders.length) { new Notice('No folders are hidden'); return; }
                new FolderPickerModal(this.app, [...this.settings.hiddenFolders], async (folder) => {
                    this.settings.hiddenFolders = this.settings.hiddenFolders.filter(f => f !== folder);
                    await this.saveSettings();
                    this._applyHiding();
                    new Notice(`Unhidden: ${folder}`);
                }).open();
            }
        });

        this.addCommand({
            id: 'keep-specific-folder',
            name: 'Keep specific folder (hide everything else)',
            callback: () => {
                const all = this.getAllFolderPaths();
                new FolderPickerModal(this.app, all, async (folder) => {
                    this.settings.hiddenFolders = all.filter(f => f !== folder);
                    await this.saveSettings();
                    this._applyHiding();
                    new Notice(`Keeping only: ${folder}`);
                }).open();
            }
        });

        this.addCommand({
            id: 'bulk-hide-folders',
            name: 'Bulk hide folders',
            callback: () => {
                const visible = this.getAllFolderPaths().filter(f => !this.settings.hiddenFolders.includes(f));
                new BulkFolderPickerModal(this.app, visible, 'Select folders to hide', async (folders) => {
                    folders.forEach(f => { if (!this.settings.hiddenFolders.includes(f)) this.settings.hiddenFolders.push(f); });
                    await this.saveSettings();
                    this._applyHiding();
                    new Notice(`Hidden ${folders.length} folders`);
                }).open();
            }
        });

        this.addCommand({
            id: 'bulk-keep-folders',
            name: 'Bulk keep folders (hide everything else)',
            callback: () => {
                const all = this.getAllFolderPaths();
                new BulkFolderPickerModal(this.app, all, 'Select folders to KEEP', async (folders) => {
                    this.settings.hiddenFolders = all.filter(f => !folders.includes(f));
                    await this.saveSettings();
                    this._applyHiding();
                    new Notice(`Keeping ${folders.length}, hiding ${this.settings.hiddenFolders.length}`);
                }).open();
            }
        });

        // Debug: log all folder paths Obsidian sees
        this.addCommand({
            id: 'debug-list-folders',
            name: 'Debug: list all folder paths in console',
            callback: () => {
                const paths = this.getAllFolderPaths();
                console.log('[FolderFocus] All folder paths:', paths);
                new Notice(`${paths.length} folders — check console (Ctrl+Shift+I)`);
            }
        });

        this.addSettingTab(new FolderFocusSettingTab(this.app, this));
    }

    onunload() {
        this.mutationObserver.disconnect();
        // Restore all hidden folders on unload
        document.querySelectorAll('.ff-hidden').forEach(el => {
            el.removeClass('ff-hidden');
            el.style.display = '';
        });
    }

    // ── Core: hide/show by directly setting style on DOM elements ────────────
    _applyHiding() {
        // First: show everything that was previously hidden by this plugin
        document.querySelectorAll('.ff-hidden').forEach(el => {
            el.removeClass('ff-hidden');
            el.style.display = '';
        });

        if (!this.settings.hiddenFolders.length) return;

        this.settings.hiddenFolders.forEach(folderPath => {
            // Obsidian uses the full vault-relative path as data-path
            // e.g. "02-Internships/02-OfficeDesChanges_2026"
            // We match both the exact path and as a suffix (endsWith) for safety
            const escaped = folderPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            const selectors = [
                // exact full path on nav-folder-title (nested folders)
                `.nav-files-container .nav-folder:has(> .nav-folder-title[data-path="${escaped}"])`,
                // exact full path directly on nav-folder
                `.nav-files-container .nav-folder[data-path="${escaped}"]`,
                // suffix match — folder name appears at end of path
                `.nav-files-container .nav-folder:has(> .nav-folder-title[data-path$="/${escaped}"])`,
            ];
            selectors.forEach(sel => {
                try {
                    document.querySelectorAll(sel).forEach(el => {
                        el.addClass('ff-hidden');
                        el.style.display = 'none';
                    });
                } catch (e) { /* invalid selector, skip */ }
            });
        });
    }

    getAllFolderPaths() {
        return this.app.vault.getAllFolders().map(f => f.path).sort();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
class FolderFocusSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Folder Focus' });

        const hidden = this.plugin.settings.hiddenFolders;
        containerEl.createEl('p', {
            text: `${hidden.length} folder(s) currently hidden. Use Ctrl+P commands to manage.`
        });

        if (hidden.length === 0) return;

        hidden.forEach(folder => {
            new Setting(containerEl)
                .setName(folder)
                .addButton(btn => btn
                    .setButtonText('Unhide')
                    .onClick(async () => {
                        this.plugin.settings.hiddenFolders = hidden.filter(f => f !== folder);
                        await this.plugin.saveSettings();
                        this.plugin._applyHiding();
                        this.display();
                    })
                );
        });

        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('Unhide all')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings.hiddenFolders = [];
                    await this.plugin.saveSettings();
                    this.plugin._applyHiding();
                    this.display();
                })
            );
    }
}

module.exports = FolderFocusPlugin;
