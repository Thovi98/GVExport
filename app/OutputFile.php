<?php
/* Output file class, which represents the file generated
 *  by Graphviz (if installed)
 */

namespace vendor\WebtreesModules\gvexport;

use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\ResponseFactoryInterface;


class OutputFile
{
    var string $tempDir;
    var string $fileType;
    var string $baseName;

    function __construct($temp_dir, $file_type) {
        global $GVE_CONFIG;
        $this->tempDir = $temp_dir;
        $this->fileType = $file_type;
        $this->baseName = $GVE_CONFIG["filename"] . "." . $GVE_CONFIG["output"][$file_type]["extension"];
    }

    /**
     * Download the output file to the user's computer
     *
     * @return mixed
     */
    function downloadFile()
    {
        global $GVE_CONFIG;
        $stream = $this->getFileStream();
        $response_factory = app(ResponseFactoryInterface::class);
        return $response_factory->createResponse()
            ->withBody($stream)
            ->withHeader('Content-Type', $GVE_CONFIG["output"][$this->fileType]["cont_type"])
            ->withHeader('Content-Disposition', "attachment; filename=" . $this->baseName);
    }

    /**
     * Run Graphviz and return the file stream of the file generated by Graphviz
     *
     * @return mixed
     */
    private function getFileStream() {
        global $GVE_CONFIG;
        $filename = $this->tempDir . "/" . $this->baseName;
        if (!empty($GVE_CONFIG["output"][$this->fileType]["exec"])) {
            $shell_cmd = str_replace($GVE_CONFIG["filename"],  $this->tempDir . "/" .$GVE_CONFIG["filename"], $GVE_CONFIG["output"][$this->fileType]["exec"]);
            exec($shell_cmd." 2>&1", $stdout_output, $return_var);
            if ($return_var !== 0)
            {
                die("Error (return code $return_var) executing command \"$shell_cmd\" in \"".getcwd()."\".<br>Graphviz error:<br><pre>".(join("\n", $stdout_output))."</pre>");
            }
        }

        return app(StreamFactoryInterface::class)->createStreamFromFile($filename);
    }

}