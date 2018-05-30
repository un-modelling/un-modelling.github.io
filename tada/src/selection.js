function selection_setup_interactions(scope) {
  _checkboxes_loop('graphs-list', tada.f(null), null, null, (x) => {
    x.onchange = (e) => {
      selection_submit(scope);
      selection_submit(ui_scopes.difference([scope])[0]);
    };
  });

  if (scope)
    _checkboxes_loop(`${ scope }-selectors-list`, null, null, null, (x) => {
      x.onchange = function(e) {
        var s  = selection_selection(scope);
        var sc = selection_completed(scope);
        var max;

        var li = this.closest('li.selector');
        this.classList.remove('warning');

        var ws = this.querySelector('.span-warning');
        if (ws) ws.remove();

        if (typeof project_settings !== 'undefined')
          max = (v) => project_settings[v]['max'];

        else if (location.get_query_param('mode') === 'projections')
          max = (v) => 2;

        else max = (v) => undefined;

        tada.f(undefined).forEach((v,i) => {
          if (typeof max(v) !== 'number') return;

          if (s[i].length > max(v)) {
            li.classList.add('warning');

            var span = document.createElement('span');
            span.classList.add('span-warning');
            span.innerText = `Select only ${max(v)}`;

            li.appendChild(span);
          }

          else if (s[i].length <= max(v)) {
            li.classList.remove('warning');

            var sw = li.querySelectorAll('.span-warning');
            if (sw.length) sw.forEach((s) => s.remove());
          }
        });

        if (sc) selection_submit(scope);
      }
    });
};

function selection_submit(scope) {
  if (selection_completed(scope)) ui_load_all(scope);
  else console.log(`${ scope } - Incomplete selection...`);
};

function selection_completed(scope) {
  return (!selection_graphs_list().empty() &&
          selection_selection(scope).filter((l) => l.empty()).empty());
};

function selection_selection(scope) {
  return tada.f(undefined).map((bind) => {
    return _checkboxes_loop(`${ scope }-selectors-list`, bind, null, true, (e) => {
      var v  = e.getAttribute('value');
      var vi = parseInt(v);

      return (isNaN(vi) ? v : vi);
    });
  });
};

function selection_uncheck_selector(value) {
  var v = value.replace(/^(reference|alternative)-/, '');
  _checkboxes_loop(null, tada.f(null), v, true, (e) => _checkbox_set(e,false));
};

function selection_graphs_list() {
  return _checkboxes_loop(`graphs-list`, tada.f(null), null, true, (e) => e.getAttribute('value'));
};

function selection_add_graphs_menu(v, arr) {
  var scope = 'none';

  _tmpl('li-selector', 'graphs-list', scope, v, tada.dict[v]);

  var t = 'checkbox';
  (window.project_settings) ? (t = window.project_settings[v]['unique'] ? 'radio' : 'checkbox') : null

  var extras = [];
  if (window.project_extra_graphs) extras = window.project_extra_graphs;

  if (!Object.keys(tada.dict._categories).length) {
    extras.concat(arr).forEach((i) => {
      _tmpl(`checkbox-selector`,
            `${scope}-${v}-selector`, v, i,
            (tada.dict[i] || i), `${v}-${scope}`, t)
    });
  }
  else {
    extras.forEach((i) => {
      _tmpl(`checkbox-selector`,
            `${scope}-${v}-selector`, v, i,
            (tada.dict[i] || i), `${v}-${scope}`, t)
    });

    Object.keys(tada.dict._categories).forEach((c) => {
      var d = document.createElement('div');
      d.classList.add(`${scope}-${v}-${c}-selector`);

      var cc = _tmpl('checkbox-caret', d, v, '', c,
                     `${scope}-${v}-${c}-selector`, 'checkbox');

      var input = cc.querySelector('input');
      input.setAttribute('checked', true);

      input.onchange = function(e) {
        var l = d.querySelectorAll('.checkbox-selector');
        l.forEach((i) => i.style.display = (this.checked ? '' : 'none'));
      }

      var b = document.createElement('button');
      b.innerText = "Toggle all";
      b.style = "float: right; font-size: xx-small; margin-left: 100px;";

      cc.appendChild(b);

      var y = document.querySelector(`#${scope}-${v}-selector`);

      arr.forEach((i) => {
        if (tada.dict._categories[c].indexOf(i) < 0) return;

        _tmpl('checkbox-selector', d, v, i,
              (tada.dict[i] || i), `${v}-${scope}`, t);
      });

      b.onclick = function(e) {
        e.preventDefault();

        var inputs = d.querySelectorAll('input.value-selector');
        inputs.forEach((c,i) => {
          c.checked = !c.checked;

          if (i === inputs.length - 1)
            c.dispatchEvent(new Event('change'));
        });
      }

      y.appendChild(d);
    });
  }

  selection_setup_interactions();
};

function selection_add_menu(scope, v, arr) {
  _tmpl('li-selector', `${ scope }-selectors-list`, scope, v, tada.dict[v]);
  var t = 'checkbox';
  (window.project_settings) ? (t = window.project_settings[v]['unique'] ? 'radio' : 'checkbox') : null

  arr.forEach((i) => _tmpl(`checkbox-selector`, `${ scope }-${ v }-selector`, v, i, (tada.dict[i] || i), `${v}-${scope}`, t));
};

function selection_clone(origin, destination) {
  tada.f(undefined).forEach((bind) => {
    _checkboxes_loop(`${ origin }-selectors-list`, bind, null, true, (e) => {
      _checkboxes_loop(`${ destination }-selectors-list`, bind, e.getAttribute('value'), null, (e) => _checkbox_set(e,true));
    });
  });
};
