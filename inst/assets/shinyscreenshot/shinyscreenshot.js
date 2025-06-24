var shinyscreenshot = {
  initScreenshot : function(params) {
    setTimeout(function() { shinyscreenshot.takeScreenshot(params) }, params.timer * 1000);
  },

  takeScreenshot : function(params) {
    var element = $(params.selector)[0];
    html2canvas(
      element, {
        scale : params.scale,
        logging : false,
        useCORS : true
      }
    ).then(function(canvas) {
      canvas.toBlob(function(blob) {
        var file = new File([blob], params.filename + ".png", { type: "image/png" });

        // Send to server if needed
        if (params.server_dir !== null) {
          var img = canvas.toDataURL();
          Shiny.setInputValue(
            `${params.namespace}shinyscreenshot:shinyscreenshot`,
            { image: img, filename : params.filename, dir : params.server_dir },
            { priority : "event" }
          );
        }

        // Use Web Share API if available
        if (params.download) {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              title: "Shiny Screenshot",
              text: "Check out this screenshot!",
              files: [file]
            }).catch(function(error) {
              console.error("Sharing failed:", error);
            });
          } else {
            // Fallback to download
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = params.filename + ".png";
            a.click();
          }
        }
      });
    });
  },

  screenshotButton : function(id) {
    var params = $("#" + id).data("shinyscreenshot-params");
    shinyscreenshot.initScreenshot(params);
  }
};

Shiny.addCustomMessageHandler('screenshot', shinyscreenshot.initScreenshot);

