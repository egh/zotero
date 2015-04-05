describe("sqlite FTS support", function() {
	Components.utils.import("resource://gre/modules/FileUtils.jsm");

	before(function() {
		this.timeout(60000);
		return Q.all([loadZoteroPane()]);
	});

	it('should add an item to fts', function () {
		this.timeout(5000);
		return withImportedAttachmentFromFile("search_foo.html", function(id) {
			let results = Zotero.DB.query("SELECT docid FROM fts_itemContent WHERE content MATCH 'foo'");
			assert.equal(results[0].docid, id);
		});
	});

	it('should still be indexed after rebuild', function () {
		this.timeout(5000);
		return withImportedAttachmentFromFile("search_foo.html", function(id) {
			// Delete the old content to ensure it is rebuild
			Zotero.DB.query("DELETE FROM fts_itemContent WHERE docid = ?", [id]);
			// TODO: Should probably ensure that
			// rebuilding actually deletes the old
			// content.
			Zotero.Fulltext.rebuildIndex();
			return waitForItemEvent("refresh").then(function(id) {
				let results = Zotero.DB.query("SELECT docid FROM fts_itemContent WHERE content MATCH 'foo' AND docid = ?", [id]);
				assert.equal(results[0].docid, id);
			});
		});
	});
});
