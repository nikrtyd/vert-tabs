const getThemeCSS = function getCurrentBrowserThemeAndApplyCSS() {
  browser.theme.getCurrent().then(theme => {
    let css = `:root {
    ${theme.colors.bookmark_text ? `--bookmark-text:${theme.colors.bookmark_text};` : ''}
    ${theme.colors.button_background_active ? `--button-background-active:${theme.colors.button_background_active};` : ''}
    ${theme.colors.button_background_hover ? `--button-background-hover:${theme.colors.button_background_hover};` : ''}
    ${theme.colors.icons ? `--icons:${theme.colors.icons};` : ''}
    ${theme.colors.icons_attention ? `--icons-attention:${theme.colors.icons_attention};` : ''}
    ${theme.colors.frame ? `--frame:${theme.colors.frame};` : ''}
    ${theme.colors.frame_inactive ? `--frame-inactive:${theme.colors.frame_inactive};` : ''}
    ${theme.colors.tab_background_text ? `--tab-background-text:${theme.colors.tab_background_text};` : ''}
    ${theme.colors.tab_line ? `--tab-line:${theme.colors.tab_line};` : ''}
    ${theme.colors.tab_loading ? `--tab-loading:${theme.colors.tab_loading};` : ''}
    ${theme.colors.tab_selected ? `--tab-selected:${theme.colors.tab_selected};` : ''}
    ${theme.colors.tab_text ? `--tab-text:${theme.colors.tab_text};` : ''}    
    ${theme.images.additional_backgrounds[0] !== undefined ? `--additional-background-0:url(${theme.images.additional_backgrounds[0]});` : ''}
    ${theme.images.additional_backgrounds[1] !== undefined ? `--additional-background-1:url(${theme.images.additional_backgrounds[1]});` : ''}
    ${theme.images.additional_backgrounds[2] !== undefined ? `--additional-background-2:url(${theme.images.additional_backgrounds[2]});` : ''}
    ${theme.images.additional_backgrounds[3] !== undefined ? `--additional-background-3:url(${theme.images.additional_backgrounds[3]});` : ''}
    ${theme.images.additional_backgrounds[4] !== undefined ? `--additional-background-4:url(${theme.images.additional_backgrounds[4]});` : ''}
    ${theme.images.additional_backgrounds[5] !== undefined ? `--additional-background-5:url(${theme.images.additional_backgrounds[5]});` : ''}
    ${theme.images.additional_backgrounds[6] !== undefined ? `--additional-background-6:url(${theme.images.additional_backgrounds[6]});` : ''}
    ${theme.images.additional_backgrounds[7] !== undefined ? `--additional-background-7:url(${theme.images.additional_backgrounds[7]});` : ''}
    ${theme.images.theme_frame ? `--theme-frame:${theme.images.theme_frame};` : ''}
  }`;
    const existingStyleEl = document.querySelector('[data-style-id="browserStyle"]');
    const styleEl = (existingStyleEl) ? existingStyleEl : document.createElement('style');
    styleEl.textContent = css;
    if (!existingStyleEl) {
      styleEl.setAttribute('type', 'text/css');
      styleEl.setAttribute('data-style-id', 'browserStyle');
      document.head.appendChild(styleEl);
    }
  });
}
getThemeCSS();
browser.theme.onUpdated.addListener(getThemeCSS);
