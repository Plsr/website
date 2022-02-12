module GenerateTags
  class TagPageGenerator < Jekyll::Generator
    safe true

    def tags_on_posts(posts)
      posts.docs.map{ |p| p.data["tags"]}.flatten.uniq
    end

    def generate(site)
      tags_on_posts(site.posts).each do |tag|
        site.pages << TagPage.new(site, tag)
      end
    end

    class TagPage < Jekyll::Page
      def initialize(site, tag)
        @site = site
        @dir = 'tags'
        @basename = tag
        @ext = '.html'
        @name = "#{@basename}#{@extension}"
        @data = {
          'tag-name' => tag,
          'layout' => 'tag'
        }
      end
    end
  end
end
