<?php
	$url = $_GET['url'];
	
	function startsWith($haystack, $needle)
	{
		 $length = strlen($needle);
		 return (substr($haystack, 0, $length) === $needle);
	}

	if(empty($url) || (!startsWith($url, 'http://') && !startsWith($url, 'https://'))){
		exit;
	}
	
	header('Content-Type: application/json');
	echo file_get_contents($url);
  
?>