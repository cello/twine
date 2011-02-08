#!/bin/sh

BINDIR=`cd \`dirname "$0"\`; pwd`
$BINDIR/../../support/requirejs/bin/x "$@"
