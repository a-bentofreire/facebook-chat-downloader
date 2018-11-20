if(/VERSION\s*[="]/i)  {
  s/^[^0-9]*([\d\.]+).*$/$1/;
  chomp;
  if (defined $a) {
    print "file1: $a. file2: $_\n";
    if($a ne $_) {
      print "VERSION DON'T MATCH\n"; exit 1;
    } else {
      print "Version Match\n"; exit 0;
    }
  } else {
    $a = $_;
  };
}