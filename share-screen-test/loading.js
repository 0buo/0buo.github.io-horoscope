function loadScript(){
    $.getScript(`./fake-3d.js`)
    .done(function() {
        $.getScript(`./page-ui.js`).fail(function(jqxhr){
            throw new Error(`load script failed: ${jqxhr}`);
        })
    })
    .fail(function(jqxhr) {
      throw new Error(`load script failed: ${jqxhr}`);
  });
}

$(window).on(`load`, loadScript);
