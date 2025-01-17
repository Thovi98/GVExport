<?php

namespace vendor\WebtreesModules\gvexport;
use Fisharebest\Webtrees\I18N;

/**
 * Main GVExport page class - functions for generating the page
 */
class MainPage
{
    /**
     * This function updates the configured names in the provided array to translated versions.
     * It is used for translating options for dropdown boxes in the module.
     *
     * @param $array
     * @return array
     */
    public static function updateTranslations($array): array
    {
        foreach ($array as $key => $value) {
            $array[$key] = I18N::translate($value);
        }
        return $array;
    }

    /**
     * Returns HTML code for the help button
     * @param string $helpType A string representing the label we are requesting help about. Normally the same as the text on the label.
     * @return string
     */
    public static function addInfoButton(string $helpType): string
    {
        return "<span class=\"info-icon btn btn-primary\" onclick=\"return showHelp('$helpType')\">i</span>";
    }

    /**
     * Returns the HTML code for the label, the option grouping on the left hand side of the settings
     * @param string $for the id of the input element this label is for
     * @param string $text the text to put on the label
     * @param bool $help
     * @return string
     */
    public static function addLabel(string $for, string $text, bool $help = TRUE): string
    {
        return '<label class="col-sm-4 col-form-label wt-page-options-label label-group" for="' . $for .'"><span class="label-text">' . I18N::translate($text) . "</span>" . ($help ? MainPage::addInfoButton($text) : "") . '</label>';
    }

}