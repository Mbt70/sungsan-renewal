$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$base = "http://iesungsan.or.kr/renewal"
$boards = @(
    "schedule",
    "z1_1", "z1_2", "z1_3",
    "z2_1", "z2_2", "z2_3", "z2_4", "z2_5",
    "z3_1", "z3_2", "z3_3", "z3_4", "z3_5", "z3_6", "z3_7", "z3_9",
    "z4_1", "z4_2", "z4_3",
    "z5_1", "z5_2", "z5_3", "z5_4", "z5_5", "z5_6",
    "z6_1", "z6_2", "z6_3"
)

$rows = foreach ($board in $boards) {
    $url = "$base/bbs/board.php?bo_table=$board"
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20
    $text = ($response.Content `
        -replace "<script[\s\S]*?</script>", " " `
        -replace "<style[\s\S]*?</style>", " " `
        -replace "<[^>]+>", " " `
        -replace "&nbsp;", " " `
        -replace "\s+", " ").Trim()

    $breadcrumb = [regex]::Match($text, "-->\s*([^>]+?>\s*[^0-9]+)\s*1 페이지").Groups[1].Value.Trim()
    $restricted = $text -match "권한이 없습니다|로그인 하십시오"

    [pscustomobject]@{
        Board = $board
        Breadcrumb = $breadcrumb
        Restricted = $restricted
        Url = $url
    }
}

$rows | Format-Table -AutoSize

