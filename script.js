(function () {
        "use strict";
        var KEY = "inkspace:v1",
          notes = [],
          active,
          $ = function (x) {
            return document.getElementById(x);
          };
        try {
          notes = JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch (x) {}
        if (!notes.length)
          notes = [
            {
              id: crypto.randomUUID(),
              title: "Welcome",
              text: "# Welcome to Inkspace\n\nWrite **Markdown** on the left and preview it safely on the right.\n\n- Local autosave\n- Searchable notes\n- Plain text export",
            },
          ];
        active = notes[0].id;
        function esc(s) {
          return s.replace(/[&<>]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
          });
        }
        function md(s) {
          return esc(s)
            .replace(/^### (.*)$/gm, "<h3>$1</h3>")
            .replace(/^## (.*)$/gm, "<h2>$1</h2>")
            .replace(/^# (.*)$/gm, "<h1>$1</h1>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/\x60(.*?)\x60/g, "<code>$1</code>")
            .replace(/^- (.*)$/gm, "• $1<br>")
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br>");
        }
        function save() {
          localStorage.setItem(KEY, JSON.stringify(notes));
          $("status").textContent = "Saved";
        }
        function cur() {
          return notes.find(function (x) {
            return x.id === active;
          });
        }
        function drawList() {
          var q = $("search").value.toLowerCase();
          $("list").innerHTML = "";
          notes
            .filter(function (x) {
              return (x.title + " " + x.text).toLowerCase().includes(q);
            })
            .forEach(function (x) {
              var b = document.createElement("button");
              b.className = "note" + (x.id === active ? " active" : "");
              b.textContent = x.title;
              b.onclick = function () {
                active = x.id;
                load();
                drawList();
              };
              $("list").appendChild(b);
            });
        }
        function render() {
          var x = cur();
          x.title = $("title").value || "Untitled";
          x.text = $("source").value;
          $("preview").innerHTML = "<p>" + md(x.text) + "</p>";
          $("count").textContent =
            x.text.length +
            " characters · " +
            (x.text.trim() ? x.text.trim().split(/\s+/).length : 0) +
            " words";
          $("status").textContent = "Saving…";
          clearTimeout(render.t);
          render.t = setTimeout(function () {
            save();
            drawList();
          }, 300);
        }
        function load() {
          var x = cur();
          $("title").value = x.title;
          $("source").value = x.text;
          render();
        }
        $("new").onclick = function () {
          var x = { id: crypto.randomUUID(), title: "Untitled note", text: "" };
          notes.unshift(x);
          active = x.id;
          save();
          load();
          drawList();
        };
        $("remove").onclick = function () {
          if (notes.length > 1 && confirm("Delete this note?")) {
            notes = notes.filter(function (x) {
              return x.id !== active;
            });
            active = notes[0].id;
            save();
            load();
            drawList();
          }
        };
        $("download").onclick = function () {
          var x = cur(),
            a = document.createElement("a");
          a.href = URL.createObjectURL(
            new Blob([x.text], { type: "text/markdown" }),
          );
          a.download = x.title.replace(/[^a-z0-9]+/gi, "-") + ".md";
          a.click();
        };
        $("source").oninput = render;
        $("title").oninput = render;
        $("search").oninput = drawList;
        load();
        drawList();
      })();
