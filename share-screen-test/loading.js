function loadScript(){
    $.getScript(`./page-ui.js`)
    .done(function() {
        $.getScript(`./fake-3d.js`).fail(function(jqxhr){
            throw new Error(`load script failed: ${jqxhr}`);
        })
    })
    .fail(function(jqxhr) {
      throw new Error(`load script failed: ${jqxhr}`);
  });
}

$(window).on(`load`, loadScript);
