const fse = require('fs-extra');
const glob = require('glob');
const path = require('path');

const prebuilt = require('@mapbox/node-pre-gyp');
const config = path.resolve(path.join(path.dirname(__dirname), 'package.json'));
const node_bindings_path = prebuilt.find(config);
const bindings_path =
  'electron' in process.versions ? node_bindings_path.replace('_node.', '_electron.') : node_bindings_path;
const bindings = (exports._bindings = require(bindings_path));

const hex = function (n) {
  const ns = n.toString(16);
  return ns.length === 8
    ? ns
    : Array(8 - ns.length)
        .fill('0')
        .reduce((a, b) => a + b) + ns;
};

const layout_dir_from_home = function (home, category, group, name, mode, layout) {
  const dir = path.join(home, category, group, name, layout, mode);
  if (!fse.existsSync(dir)) {
    fse.ensureDirSync(dir);
  }
  return dir;
};

const locator = function (home) {
  return {
    has_env: function (name) {
      return name in process.env;
    },
    get_env: function (name) {
      return process.env[name];
    },
    layout_dir: function (category, group, name, mode, layout) {
      return layout_dir_from_home(home, category, group, name, mode, layout);
    },
    layout_file: function (category, group, name, mode, layout, file_name) {
      return path.join(layout_dir_from_home(home, category, group, name, mode, layout), file_name + '.' + layout);
    },
    list_page_id: function (category, group, name, mode, dest_id) {
      const suffix = '.journal';
      const dest_dir = layout_dir_from_home(home, category, group, name, mode, 'journal');
      const file_re = path.join(dest_dir, hex(dest_id) + '.*' + suffix);
      const pages = glob.sync(file_re);
      return pages.map((p) =>
        parseInt(p.substr(dest_dir.length + 10, p.length - dest_dir.length - 10 - suffix.length)),
      );
    },
    list_locations: function (category, group, name, mode) {
      const locations = [];
      const search_path = path.join(home, category, group, name, 'journal', mode);
      glob.sync(search_path).map((p) => {
        const dirs = p.split(path.sep);
        const m = dirs.slice(dirs.length - 5);
        locations.push({ category: m[0], group: m[1], name: m[2], mode: m[4] });
      });
      return locations;
    },
    list_location_dest: function (category, group, name, mode) {
      const dest_dir = layout_dir_from_home(home, category, group, name, mode, 'journal');
      const pages = glob.sync(path.join(dest_dir, '*.journal'));
      const destObj = {};
      pages.map((p) => {
        const uid = p.match(/.\w+\.\d+\.journal/g)[0].substr(1, 9);
        destObj[uid] = uid;
      });
      return Object.keys(destObj).map((k) => parseInt(k, 16));
    },
  };
};

exports.longfist = bindings.longfist;

exports.formatTime = bindings.formatTime;

exports.formatStringToHashHex = bindings.formatStringToHashHex;

exports.parseTime = bindings.parseTime;

exports.Assemble = function (arg) {
  if (Array.isArray(arg)) {
    return new bindings.Assemble(
      arg.map(function (home) {
        return locator(home);
      }),
    );
  } else {
    return new bindings.Assemble([locator(arg)]);
  }
};

exports.IODevice = function (category, group, name, mode, home) {
  return new bindings.IODevice(category, group, name, mode, locator(home));
};

exports.History = function (home) {
  return new bindings.History(locator(home));
};

exports.ConfigStore = function (home) {
  return new bindings.ConfigStore(locator(home));
};

exports.CommissionStore = function (home) {
  return new bindings.CommissionStore(locator(home));
};

exports.watcher = function (home, name, bypassQuotes = false, bypassRestore = false) {
  return new bindings.Watcher(locator(home), name, bypassQuotes, bypassRestore);
};