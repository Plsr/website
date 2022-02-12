module GenerateTags
  class TagPageGenerator < Jekyll::Generator
    safe true

    def generate(site)
      pp "i ran"
      site.posts.each do |post|
        pp post.tags
      end
    end
  end
end
