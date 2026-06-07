import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  SUNGSAN_BOARD_CONFIGS,
  buildBoardUpsertSql,
  buildSetupSql,
  buildWriteTableSql,
  escapeSqlString,
  writeSetupSqlFile,
} from '../../tools/setup/gnuboard-setup.mjs';

const writeSqlTemplate = `CREATE TABLE \`__TABLE_NAME__\` (
  \`wr_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`wr_subject\` varchar(255) NOT NULL,
  \`wr_content\` text NOT NULL,
  PRIMARY KEY (\`wr_id\`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;`;

describe('sungsan gnuboard setup config', () => {
  it('defines the planned news and free boards', () => {
    assert.equal(SUNGSAN_BOARD_CONFIGS.length, 2);

    const news = SUNGSAN_BOARD_CONFIGS.find((board) => board.bo_table === 'news');
    const free = SUNGSAN_BOARD_CONFIGS.find((board) => board.bo_table === 'free');

    assert.equal(news.bo_subject, '소식');
    assert.equal(news.bo_skin, 'sungsan_news');
    assert.equal(news.bo_use_category, 1);
    assert.equal(news.bo_category_list, '공지|행사|자료|규정|활동소식');
    assert.equal(news.bo_list_level, 1);
    assert.equal(news.bo_write_level, 6);
    assert.equal(news.bo_upload_level, 6);
    assert.equal(news.bo_upload_size, 20971520);
    assert.equal(news.bo_download_level, 1);
    assert.equal(news.bo_1_subj, '소속 slug');
    assert.equal(news.bo_2_subj, '공개 범위');
    assert.equal(news.bo_3_subj, '행사 시작일');
    assert.equal(news.bo_4_subj, '행사 종료일');
    assert.equal(news.bo_5_subj, '기존 보드 ID');
    assert.equal(news.bo_6_subj, '기존 글 ID');
    assert.equal(news.bo_7_subj, '이전 검토 플래그');
    assert.equal(news.bo_8_subj, '검토 사유');

    assert.equal(free.bo_subject, '자유게시판');
    assert.equal(free.bo_skin, 'sungsan_free');
    assert.equal(free.bo_list_level, 1);
    assert.equal(free.bo_read_level, 2);
    assert.equal(free.bo_write_level, 2);
    assert.equal(free.bo_upload_size, 20971520);
  });

  it('escapes SQL strings without changing Korean text', () => {
    assert.equal(escapeSqlString("성산회's 자료"), "성산회''s 자료");
  });

  it('builds an idempotent board upsert statement', () => {
    const sql = buildBoardUpsertSql(SUNGSAN_BOARD_CONFIGS[0], { tablePrefix: 'g5_' });

    assert.match(sql, /INSERT INTO `g5_board`/);
    assert.match(sql, /bo_table = 'news'/);
    assert.match(sql, /bo_skin = 'sungsan_news'/);
    assert.match(sql, /bo_download_level = '1'/);
    assert.match(sql, /bo_upload_size = '20971520'/);
    assert.match(sql, /bo_1_subj = '소속 slug'/);
    assert.match(sql, /bo_8_subj = '검토 사유'/);
    assert.match(sql, /bo_category_list = '공지\|행사\|자료\|규정\|활동소식'/);
    assert.match(sql, /ON DUPLICATE KEY UPDATE/);
    assert.match(sql, /bo_subject = VALUES\(bo_subject\)/);
    assert.match(sql, /bo_8_subj = VALUES\(bo_8_subj\)/);
  });

  it('normalizes write table DDL to the requested table and utf8mb4', () => {
    const sql = buildWriteTableSql('news', writeSqlTemplate, { tablePrefix: 'g5_' });

    assert.match(sql, /CREATE TABLE IF NOT EXISTS `g5_write_news`/);
    assert.match(sql, /DEFAULT CHARSET=utf8mb4/);
    assert.doesNotMatch(sql, /__TABLE_NAME__/);
  });

  it('builds complete setup SQL with theme, group, boards, and write tables', () => {
    const sql = buildSetupSql({ tablePrefix: 'g5_', writeSqlTemplate });

    assert.match(sql, /UPDATE `g5_config` SET/);
    assert.match(sql, /cf_theme = 'sungsan'/);
    assert.match(sql, /cf_member_skin = 'sungsan'/);
    assert.match(sql, /cf_mobile_member_skin = 'sungsan'/);
    assert.match(sql, /cf_register_level = '1'/);
    assert.match(sql, /-- account policy: 신규 가입은 cf_register_level=1로 대기 상태이며 운영자 승인 후 권한을 부여합니다\./);
    assert.match(sql, /-- account policy: 기본 admin ID를 사용하지 않고 실명 운영자 계정만 유지합니다\./);
    assert.match(sql, /-- account policy: 임원은 mb_level >= 6, 운영자는 mb_level = 10으로 분리합니다\./);
    assert.match(sql, /cf_use_homepage = '0'/);
    assert.match(sql, /cf_req_homepage = '0'/);
    assert.match(sql, /cf_use_addr = '0'/);
    assert.match(sql, /cf_req_addr = '0'/);
    assert.match(sql, /cf_use_signature = '0'/);
    assert.match(sql, /cf_use_profile = '0'/);
    assert.match(sql, /cf_use_recommend = '0'/);
    assert.match(sql, /cf_use_member_icon = '0'/);
    assert.match(sql, /cf_member_icon_size = '0'/);
    assert.match(sql, /cf_member_icon_width = '0'/);
    assert.match(sql, /cf_member_icon_height = '0'/);
    assert.match(sql, /cf_member_img_size = '0'/);
    assert.match(sql, /cf_member_img_width = '0'/);
    assert.match(sql, /cf_member_img_height = '0'/);
    assert.match(sql, /INSERT INTO `g5_group`/);
    assert.match(sql, /gr_id = 'sungsan'/);
    assert.match(sql, /bo_table = 'news'/);
    assert.match(sql, /bo_table = 'free'/);
    assert.match(sql, /bo_upload_size = '20971520'/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS `g5_write_news`/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS `g5_write_free`/);
  });

  it('documents board metadata and access policy inside generated setup SQL', () => {
    const sql = buildSetupSql({ tablePrefix: 'g5_', writeSqlTemplate });

    assert.match(sql, /-- news: 통합 소식 게시판/);
    assert.match(sql, /-- news ca_name: 공지\|행사\|자료\|규정\|활동소식/);
    assert.match(sql, /-- news wr_1 소속 slug, wr_2 공개 범위, wr_3 행사 시작일, wr_4 행사 종료일/);
    assert.match(sql, /-- news wr_5 기존 보드 ID, wr_6 기존 글 ID, wr_7 이전 검토 플래그, wr_8 검토 사유/);
    assert.match(sql, /-- news access: 목록과 상세 라우트는 공개, 본문과 첨부는 wr_2 공개 범위로 제한/);
    assert.match(sql, /-- news write access: 작성\/수정\/삭제\/첨부 업로드는 임원 이상/);
    assert.match(sql, /-- free: 회원 자유게시판/);
    assert.match(sql, /-- free access: 목록은 공개, 본문\/작성\/댓글\/첨부\/다운로드는 회원 이상/);
  });

  it('keeps the tracked generated setup SQL in sync with policy comments', async () => {
    const [generatedSql, writeTableTemplate] = await Promise.all([
      readFile(path.join(process.cwd(), 'docs', 'generated', 'sungsan-setup.sql'), 'utf8'),
      readFile(path.join(process.cwd(), 'www', 'adm', 'sql_write.sql'), 'utf8'),
    ]);

    const expectedSql = buildSetupSql({ tablePrefix: 'g5_', writeSqlTemplate: writeTableTemplate });

    assert.equal(generatedSql, expectedSql);
    assert.match(generatedSql, /-- account policy: 신규 가입은 cf_register_level=1로 대기 상태이며 운영자 승인 후 권한을 부여합니다\./);
    assert.match(generatedSql, /-- account policy: 기본 admin ID를 사용하지 않고 실명 운영자 계정만 유지합니다\./);
    assert.match(generatedSql, /-- account policy: 임원은 mb_level >= 6, 운영자는 mb_level = 10으로 분리합니다\./);
    assert.match(generatedSql, /-- news: 통합 소식 게시판/);
    assert.match(generatedSql, /-- news access: 목록과 상세 라우트는 공개, 본문과 첨부는 wr_2 공개 범위로 제한/);
    assert.match(generatedSql, /-- news write access: 작성\/수정\/삭제\/첨부 업로드는 임원 이상/);
    assert.match(generatedSql, /-- free access: 목록은 공개, 본문\/작성\/댓글\/첨부\/다운로드는 회원 이상/);
  });

  it('writes setup SQL to a file and creates parent directories', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'sungsan-setup-'));
    const outputPath = path.join(dir, 'nested', 'sungsan-setup.sql');

    try {
      const result = await writeSetupSqlFile({ outputPath, writeSqlTemplate });
      const content = await readFile(outputPath, 'utf8');

      assert.equal(result.outputPath, outputPath);
      assert.match(content, /Sungsan GnuBoard5 setup SQL/);
      assert.match(content, /CREATE TABLE IF NOT EXISTS `g5_write_news`/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
