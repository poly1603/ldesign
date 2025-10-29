import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '@ldesign/engine-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  
  // State
  locale = 'en';
  theme = 'light';
  size = 'medium';
  status = 'initialized';
  eventLog: string[] = [];
  
  // Translations
  translations: any = {};

  constructor(private engineService: EngineService) {}

  ngOnInit() {
    // 订阅 locale 变化
    this.subscriptions.add(
      this.engineService.locale$.subscribe(locale => {
        this.locale = locale;
        this.updateTranslations();
      })
    );

    // 订阅 theme 变化
    this.subscriptions.add(
      this.engineService.theme$.subscribe(theme => {
        this.theme = theme;
        this.applyTheme();
      })
    );

    // 订阅 size 变化
    this.subscriptions.add(
      this.engineService.size$.subscribe(size => {
        this.size = size;
      })
    );

    // 订阅 status 变化
    this.subscriptions.add(
      this.engineService.status$.subscribe(status => {
        this.status = status;
      })
    );

    // 订阅所有事件
    this.subscriptions.add(
      this.engineService.events$.subscribe(event => {
        this.eventLog.unshift(`[${event.type}] ${JSON.stringify(event.payload)}`);
        if (this.eventLog.length > 10) {
          this.eventLog = this.eventLog.slice(0, 10);
        }
      })
    );

    // 初始化
    this.updateTranslations();
    this.applyTheme();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateTranslations() {
    const i18nPlugin = this.engineService.getPlugin('i18n');
    if (i18nPlugin?.api) {
      this.translations = i18nPlugin.api;
    }
  }

  applyTheme() {
    const themePlugin = this.engineService.getPlugin('theme');
    if (themePlugin?.api) {
      const currentTheme = themePlugin.api.getCurrentTheme();
      document.documentElement.style.setProperty('--primary-color', currentTheme.colors.primary);
      document.documentElement.style.setProperty('--bg-color', currentTheme.colors.background);
      document.documentElement.style.setProperty('--text-color', currentTheme.colors.text);
    }
  }

  switchTheme() {
    const themePlugin = this.engineService.getPlugin('theme');
    if (themePlugin?.api) {
      const newTheme = this.theme === 'light' ? 'dark' : 'light';
      themePlugin.api.setTheme(newTheme);
    }
  }

  switchLocale() {
    const i18nPlugin = this.engineService.getPlugin('i18n');
    if (i18nPlugin?.api) {
      const newLocale = this.locale === 'en' ? 'zh' : 'en';
      i18nPlugin.api.setLocale(newLocale);
    }
  }

  changeSize(size: string) {
    const sizePlugin = this.engineService.getPlugin('size');
    if (sizePlugin?.api) {
      sizePlugin.api.setSize(size);
    }
  }

  t(key: string): string {
    const keys = key.split('.');
    let value = this.translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }
}
