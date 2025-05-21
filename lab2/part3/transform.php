<?php
// Load the XML source
$xml = new DOMDocument;
$xml->load('students.xml');

// Load the XSL stylesheet
$xsl = new DOMDocument;
$xsl->load('students.xsl');

// Configure the transformer
$proc = new XSLTProcessor;
$proc->importStyleSheet($xsl); // attach the XSL rules

// Transform and output the result
echo $proc->transformToXML($xml);
?>