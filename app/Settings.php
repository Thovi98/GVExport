<?php

namespace vendor\WebtreesModules\gvexport;

use Fisharebest\Webtrees\Auth;
use Fisharebest\Webtrees\Http\Exceptions\HttpBadRequestException;
use Fisharebest\Webtrees\I18N;

class Settings
{
    public const ID_MAIN_SETTINGS = "_MAIN_";
    public const ID_ALL_SETTINGS = "_ALL_";
    public const GUEST_USER_ID = 0;
    private const ADMIN_PREFERENCE_NAME = "_admin_settings";
    public const PREFERENCE_PREFIX = "GVE";
    public const SETTINGS_LIST_PREFERENCE_NAME = "_id_list";
    public const SAVED_SETTINGS_LIST_PREFERENCE_NAME = "_shared_settings_list";
    const TREE_PREFIX = "_t";
    const USER_PREFIX = "_u";
    private array $settings_json_cache = [];
    private array $defaultSettings;
    public function __construct(){
        // Load settings from config file
        $this->defaultSettings = include dirname(__FILE__) . "/../config.php";
        // Add options lists
        $this->defaultSettings['typefaces'] = [0 => "Arial", 10 => "Brush Script MT", 20 => "Courier New", 30 => "Garamond", 40 => "Georgia", 50 => "Tahoma", 60 => "Times New Roman", 70 => "Trebuchet MS", 80 => "Verdana"];
        $this->defaultSettings['typeface_fallback'] = [0 => "Sans",  10 => "Cursive", 20 => "Monospace", 30 => "Serif", 40 => "Serif", 50 => "Sans", 60 => "Serif", 70 => "Sans", 80 => "Sans"];
        $this->defaultSettings['directions']['TB'] = "Top-to-bottom";
        $this->defaultSettings['directions']['LR'] = "Left-to-right";
        $this->defaultSettings['url_xref_treatment_options']['default'] = "Default";
        $this->defaultSettings['url_xref_treatment_options']['add'] = "Add to list";
        $this->defaultSettings['url_xref_treatment_options']['nothing'] = "Don't add to list";
        $this->defaultSettings['url_xref_treatment_options']['overwrite'] = "Overwrite";
        $this->defaultSettings['use_abbr_places'] = [0 => "Full place name", 10 => "City and country" ,  20 => "City and 2 letter ISO country code", 30 => "City and 3 letter ISO country code"];
        $this->defaultSettings['use_abbr_names'] = [0 => "Full name", 10 => "Given and surnames", 20 => "Given names" , 30 => "First given name only", 40 => "Surnames", 50 => "Initials only", 60 => "Given name initials and surname", 70 => "Don't show names"];
        $this->defaultSettings['photo_shape_options'] = [0 => "No change", 10 => "Oval", 20 => "Circle" , 30 => "Square", 40 => "Rounded rectangle", 50 => "Rounded square"];
        $this->defaultSettings['countries'] = $this->getCountryAbbreviations();
        if (!$this->isGraphvizAvailable($this->defaultSettings['graphviz_bin'])) {
            $this->defaultSettings['graphviz_bin'] = "";
        }
        $this->defaultSettings['graphviz_config'] = $this->getGraphvizSettings($this->defaultSettings);
    }

    /**
     * Retrieve the currently set default settings from the admin page
     *
     * @return array
     */
    public function getDefaultSettings(): array
    {
        return $this->defaultSettings;
    }

    /**
     * Retrieve the currently set default settings from the admin page
     *
     * @param $module
     * @return array
     */
    public function getAdminSettings($module): array
    {
        $settings = $this->defaultSettings;
        $loaded = $module->getPreference(self::PREFERENCE_PREFIX . self::ADMIN_PREFERENCE_NAME, "preference not set");
        if ($loaded != "preference not set") {
            $loaded_settings = json_decode($loaded, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                foreach ($settings as $preference => $value) {
                    if (self::shouldLoadSetting($preference, true)) {
                        if (isset($loaded_settings[$preference])) {
                            $pref = $loaded_settings[$preference];
                            if ($pref == 'true' || $pref == 'false') {
                                $settings[$preference] = ($pref == 'true');
                            } else {
                                $settings[$preference] = $pref;
                            }
                        }
                    }
                }
            } else {
                throw new HttpBadRequestException(I18N::translate('Invalid JSON') . " 1: " . json_last_error_msg() . $loaded);
            }
        }
        $settings['graphviz_config'] = $this->getGraphvizSettings($settings);
        return $settings;

    }

    /**
     * Retrieve the user settings from webtrees storage
     *
     * @param $module
     * @param $tree
     * @param bool $reset
     * @param string $id
     * @return array
     */
    public function loadUserSettings($module, $tree, string $id = self::ID_MAIN_SETTINGS, $user_id = null): array
    {
        if ($user_id === null) {
            $user_id = Auth::user()->id();
        }
        $settings = $this->getAdminSettings($module);
        if ($user_id == self::GUEST_USER_ID) {
            $cookie = new Cookie($tree);
            $settings = $cookie->load($settings);
        } else {
            $settings_pref_name = self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . $user_id;
            $loaded = $this->settings_json_cache[$settings_pref_name] ?? $module->getPreference($settings_pref_name, "preference not set");
            if ($loaded != "preference not set") {
                $all_settings = json_decode($loaded, true);
                if ($id == self::ID_ALL_SETTINGS) {
                    unset($all_settings[self::ID_MAIN_SETTINGS]);
                    return $all_settings;
                } else {
                    if (isset($all_settings[$id]) && json_last_error() === JSON_ERROR_NONE) {
                        $loaded_settings = json_decode($all_settings[$id]['settings'], true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            foreach ($settings as $preference => $value) {
                                if (self::shouldLoadSetting($preference)) {
                                    if (isset($loaded_settings[$preference])) {
                                        $pref = $loaded_settings[$preference];
                                        if ($pref == 'true' || $pref == 'false') {
                                            $settings[$preference] = ($pref == 'true');
                                        } else {
                                            $settings[$preference] = $pref;
                                        }
                                    }
                                }
                            }
                        } else {
                            throw new HttpBadRequestException(I18N::translate('Invalid JSON') . " 1: " . json_last_error_msg() . $loaded);
                        }
                    } else {
                        if ($id !== self::ID_MAIN_SETTINGS) {
                            throw new HttpBadRequestException(I18N::translate('Invalid settings ID') . " " . e($id) . ": " . json_last_error_msg());
                        }
                    }
                }
            } else {
                $settings['first_run_xref_check'] = true;
            }
        }
        if (!$settings['enable_graphviz'] && $settings['graphviz_bin'] != "") {
            $settings['graphviz_bin'] = "";
        }
        return $settings;
    }

    /**
     *  Save the provided settings to webtrees admin storage
     *
     * @param $module
     * @param $settings
     * @return void
     */
    public function saveAdminSettings($module, $settings) {
        $saveSettings = $this->defaultSettings;
        $s = [];
        foreach ($saveSettings as $preference=>$value) {
            if (self::shouldSaveSetting($preference, true)) {
                if (isset($settings[$preference])) {
                    if (gettype($value) == 'boolean') {
                        $s[$preference] = ($settings[$preference] ? 'true' : 'false');
                    } else {
                        $s[$preference] = $settings[$preference];
                    }
                } else {
                    $s[$preference] = 'false';
                }
            }
        }
        $json = json_encode($s);
        $module->setPreference(self::PREFERENCE_PREFIX . self::ADMIN_PREFERENCE_NAME, $json);
    }

    /**
     *  Save the provided settings to webtrees user per-tree storage
     *
     * @param $module
     * @param $tree
     * @param $settings
     * @param string $id
     * @return bool
     */
    public function saveUserSettings($module, $tree, $settings, string $id = self::ID_MAIN_SETTINGS): bool
    {
        if (Auth::user()->id() == self::GUEST_USER_ID) {
            if ($id == self::ID_MAIN_SETTINGS) {
                $cookie = new Cookie($tree);
                $cookie->set($settings);
                return true;
            } else {
                return false; // Logged-out users are handled in local storage, this should never happen
            }
        } else {
            $s = [];
            foreach ($settings as $preference => $value) {
                if (self::shouldSaveSetting($preference)) {
                    if (gettype($value) == 'boolean') {
                        $s[$preference] = ($value ? 'true' : 'false');
                    } else {
                        $s[$preference] = $value;
                    }
                }
            }

            $this->addUserSettings($module, $tree, $id, $s);
            return true;
        }
    }

    public function deleteUserSettings($module, $tree, $id) {
        if (Settings::isUserLoggedIn()) {
            $loaded = $module->getPreference(self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . Auth::user()->id(), "preference not set");
            if ($loaded != "preference not set") {
                $all_settings = json_decode($loaded, true);
                if (isset($all_settings[$id]) && json_last_error() === JSON_ERROR_NONE) {
                    unset($all_settings[$id]);
                } else {
                    throw new HttpBadRequestException(I18N::translate('Invalid settings ID') . " " . e($id) . ": " . json_last_error_msg());
                }
                $new_json = json_encode($all_settings);
                $module->setPreference(self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . Auth::user()->id(), $new_json);
                $this->deleteSettingsId($module, $tree, $id);
                $settingsLink = new settingsLink($module, $tree, $this, $id);
                if (!$settingsLink->removeTokenRecord()) {
                    throw new HttpBadRequestException(I18N::translate('Invalid') . " - E1");
                }
            }
        }
    }

    /**
     * Check if exec function is available to prevent error if webserver has disabled it
     * From: https://stackoverflow.com/questions/3938120/check-if-exec-is-disabled
     * @return bool
     */
    private function is_exec_available(): bool
    {
        static $available;

        if (!isset($available)) {
            $available = true;
            if (ini_get('safe_mode')) {
                $available = false;
            } else {
                $d = ini_get('disable_functions');
                $s = ini_get('suhosin.executor.func.blacklist');
                if ("$d$s") {
                    $array = preg_split('/,\s*/', "$d,$s");
                    if (in_array('exec', $array)) {
                        $available = false;
                    }
                }
            }
        }

        return $available;
    }

    /**
     * Check if Graphviz is available
     *
     * @param $binPath
     * @return mixed|string
     */
    private function isGraphvizAvailable($binPath)
    {
        static $outcome;

        if (!isset($outcome)) {
            if ($binPath == "") {
                $outcome = false;
                return false;
            }
            $stdout_output = null;
            $return_var = null;
            if ($this->is_exec_available()) {
                exec($binPath . " -V" . " 2>&1", $stdout_output, $return_var);
            }
            if (!$this->is_exec_available() || $return_var !== 0) {
                $outcome = false;
            } else {
                $outcome = true;
            }
        }
        return $outcome;
    }

    /**
     * Load country data for abbreviating place names
     * Data comes from https://www.datahub.io/core/country-codes
     * This material is licensed by its maintainers under the Public Domain Dedication and License, however,
     * they note that the data is ultimately sourced from ISO who have an unclear licence regarding use,
     * particularly around commercial use. Though all data sources providing ISO data have this problem.
     * @return array
     */
    private function getCountryAbbreviations(): array
    {
        $string = file_get_contents(dirname(__FILE__) . "/../resources/data/country-codes_json.json");
        $json = json_decode($string, true);
        $countries = [];
        foreach ($json as $row) {
            $countries['iso2'][strtolower($row['Name'])] = $row['ISO3166-1-Alpha-2'];
            $countries['iso3'][strtolower($row['Name'])] = $row['ISO3166-1-Alpha-3'];
        }
        return $countries;
    }

    private function getGraphvizSettings($settings): array
    {
        // Output file formats
        $Graphviz['output']['svg']['label'] = "SVG"; #ESL!!! 20090213
        $Graphviz['output']['svg']['extension'] = "svg";
        $Graphviz['output']['svg']['exec'] = $settings['graphviz_bin'] . " -Tsvg:cairo -o" . $settings['filename'] . ".svg " . $settings['filename'] . ".dot";
        $Graphviz['output']['svg']['cont_type'] = "image/svg+xml";

        $Graphviz['output']['dot']['label'] = "DOT"; #ESL!!! 20090213
        $Graphviz['output']['dot']['extension'] = "dot";
        $Graphviz['output']['dot']['exec'] = "";
        $Graphviz['output']['dot']['cont_type'] = "text/plain; charset=utf-8";

        $Graphviz['output']['png']['label'] = "PNG"; #ESL!!! 20090213
        $Graphviz['output']['png']['extension'] = "png";
        $Graphviz['output']['png']['exec'] = $settings['graphviz_bin'] . " -Tpng -o" . $settings['filename'] . ".png " . $settings['filename'] . ".dot";
        $Graphviz['output']['png']['cont_type'] = "image/png";

        $Graphviz['output']['jpg']['label'] = "JPG"; #ESL!!! 20090213
        $Graphviz['output']['jpg']['extension'] = "jpg";
        $Graphviz['output']['jpg']['exec'] = $settings['graphviz_bin'] . " -Tjpg -o" . $settings['filename'] . ".jpg " . $settings['filename'] . ".dot";
        $Graphviz['output']['jpg']['cont_type'] = "image/jpeg";

        $Graphviz['output']['pdf']['label'] = "PDF"; #ESL!!! 20090213
        $Graphviz['output']['pdf']['extension'] = "pdf";
        $Graphviz['output']['pdf']['exec'] = $settings['graphviz_bin'] . " -Tpdf -o" . $settings['filename'] . ".pdf " . $settings['filename'] . ".dot";
        $Graphviz['output']['pdf']['cont_type'] = "application/pdf";

        if ( !empty( $settings['graphviz_bin']) && $settings['graphviz_bin'] != "") {

            $Graphviz['output']['gif']['label'] = "GIF"; #ESL!!! 20090213
            $Graphviz['output']['gif']['extension'] = "gif";
            $Graphviz['output']['gif']['exec'] = $settings['graphviz_bin'] . " -Tgif -o" . $settings['filename'] . ".gif " . $settings['filename'] . ".dot";
            $Graphviz['output']['gif']['cont_type'] = "image/gif";

            $Graphviz['output']['ps']['label'] = "PS"; #ESL!!! 20090213
            $Graphviz['output']['ps']['extension'] = "ps";
            $Graphviz['output']['ps']['exec'] = $settings['graphviz_bin'] . " -Tps2 -o" . $settings['filename'] . ".ps " . $settings['filename'] . ".dot";
            $Graphviz['output']['ps']['cont_type'] = "application/postscript";
        }

        return $Graphviz;
    }

    /**
     * Returns whether a setting shouldn't be saved to cookies/preferences
     *
     * @param string $preference
     * @param bool $admin
     * @return bool
     */
    public static function shouldSaveSetting(string $preference, bool $admin = false): bool
    {
        switch ($preference) {
            case 'graphviz_bin':
            case 'graphviz_config':
            case 'typefaces':
            case 'typeface_fallback':
            case 'default_typeface':
            case 'directions':
            case 'url_xref_treatment_options':
            case 'use_abbr_places':
            case 'use_abbr_names':
            case 'countries':
            case 'temp_dir':
            case 'space_base':
            case 'no_fams':
            case 'stop_proc':
            case 'compress_cookie':
            case 'photo_shape_options':
                return false;
            case 'show_debug_panel':
            case 'filename':
            case 'mclimit':
            case 'birth_prefix':
            case 'death_prefix':
                return $admin;
            default:
                return true;
        }
    }

    /**
     * Currently an alias for shouldLoadSetting as the criteria are the same
     *
     * @param $setting
     * @param bool $admin
     * @return bool
     */
    public static function shouldLoadSetting($setting, bool $admin = false): bool
    {
        return self::shouldSaveSetting($setting, $admin);
    }

    /**
     * @throws \Exception
     */
    public function getSettingsJson($module, $tree, $id)
    {
        try {
            $userSettings = $this->loadUserSettings($module, $tree, $id);
            $settings = [];

            foreach ($this->defaultSettings as $preference => $value) {
                if (self::shouldLoadSetting($preference)) {
                    $settings[$preference] = $userSettings[$preference];
                }
            }
        } catch (\Exception $e) {
            throw new \Exception($e);
        }
        return json_encode($settings);
    }

    public function getAllSettingsJson($module, $tree)
    {
        $settings = $this->loadUserSettings($module, $tree, Settings::ID_ALL_SETTINGS);
        return json_encode($settings);
    }

    public function getSettingsLink($module, $tree, $id): array
    {
        if ($this->doSettingsExist($module, $tree)) {
            $link = new settingsLink($module, $tree, $this, $id);
            try {
                $response['url'] = $link->getUrl();
                $response['success'] = true;
            } catch (\Exception $error) {
                $response['success'] = false;
                $response['error'] = $error;
            }

        } else {
            $response['success'] = false;
            $response['error'] = "Settings don't exist";
        }

        return $response;
    }

    /**
     * @throws \Exception
     */
    public function loadSettingsToken($module, $tree, $token): array
    {
        $link = new settingsLink($module, $tree, $this);
        try {
            $settings = $link->loadToken($token, $this);
        } catch (\Exception $e) {
            throw new \Exception($e);
        }
        return $settings;
    }

    public function newSettingsId($module, $tree): string
    {
        $id_list = $this->getSettingsIdList($module, $tree);

        if ($id_list == "") {
            $id_list = "0";
            $new_id = "0";
        } else {
            $preferences = explode(',', $id_list);
            $last_id = end($preferences);
            if ($last_id != "") {
                $next_id = (int)base_convert($last_id, 36, 10) + 1;
                $new_id = base_convert($next_id, 10, 36);
                $id_list = $id_list . "," . $new_id;
            } else {
                return "";
            }
        }
        $this->setSettingsIdList($module, $tree, $id_list);
        return $new_id;
    }

    public function deleteSettingsId($module, $tree, $id): string
    {
        $id_list = $this->getSettingsIdList($module, $tree);
        if ($id_list == "") {
           return false;
        } else {
            $preferences = explode(',', $id_list);
            $key = array_search($id, $preferences);
            unset($preferences[$key]);
            if ($this->setSettingsIdList($module, $tree, implode(',', $preferences))) {
                return true;
            } else {
                return false;
            }
        }
    }

    private function getSettingsIdList($module, $tree) {
        $user = Auth::user()->id();
        $use_cookie = $user == self::GUEST_USER_ID;
        if ($use_cookie) {
            return ""; // Logged-out users are handled via local storage, so this should never happen
        } else {
            $pref_list = $module->getPreference(self::PREFERENCE_PREFIX . self::SETTINGS_LIST_PREFERENCE_NAME . self::TREE_PREFIX . $tree->id(), "preference not set");
            if ($pref_list == "preference not set") {
                $pref_list = "";
            }
        }
        return $pref_list;
    }

    public static function isUserLoggedIn(): bool
    {
        if (Auth::user()->id() == self::GUEST_USER_ID) {
            return false;
        } else {
            return true;
        }
    }

    private function addUserSettings($module, $tree, $id, array $s)
    {
        $prefs_json = $module->getPreference(self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . Auth::user()->id(), "preference not set");
        if ($prefs_json == "preference not set") {
            $settings = [];
        } else {
            $settings = json_decode($prefs_json, true);
        }
        $json = json_encode($s);
        $settings[$id]['settings'] = $json;
        $settings[$id]['name'] = $s['save_settings_name'];
        $settings[$id]['id'] = $id;
        $settings[$id]['token'] = empty($s['token']) ? '':$s['token'];
        $new_json = json_encode($settings);
        $module->setPreference(self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . Auth::user()->id(), $new_json);
    }

    private function setSettingsIdList($module, $tree, string $id_list): bool
    {
        $use_cookie = Auth::user()->id() == self::GUEST_USER_ID;
        if ($use_cookie) {
            return false; // Logged-out users are handled in local storage, this should never happen
        } else {
            $module->setPreference(self::PREFERENCE_PREFIX . self::SETTINGS_LIST_PREFERENCE_NAME . self::TREE_PREFIX . $tree->id(), $id_list);
            return true;
        }
    }

    private function doSettingsExist($module, $tree): bool
    {
        if (Auth::user()->id() == self::GUEST_USER_ID) {
            return false;
        } else {
            $settings_pref_name = self::PREFERENCE_PREFIX . self::TREE_PREFIX . $tree->id() . self::USER_PREFIX . Auth::user()->id();
            $loaded = $this->settings_json_cache[$settings_pref_name] ?? $module->getPreference($settings_pref_name, "preference not set");
            if ($loaded == "preference not set") {
                return false;
            } else {
                return true;
            }
        }
    }

    public function revokeSettingsToken($module, $tree, $token): bool
    {
        $settingsLink = new settingsLink($module, $tree, $this);
        return $settingsLink->revokeToken($token);
    }

    public function getSettingsName($module, $tree, $settings_id)
    {
        $userSettings = $this->loadUserSettings($module, $tree, $settings_id);
        return $userSettings['save_settings_name'];
    }
}