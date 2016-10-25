/**
 * Created by Rohan on 10/1/2016.
 */
(function($) {
    Drupal.behaviors.categorySelector = {
        attach: function(context) {
            var $category_item = $('.view-content-category .views-field-name');
            var $category_input = $('#edit-field-featured-categories-und');
            $category_item.click(function() {
                var text = $(this).text().trim();
                $category_input.val(text);
            });
        }
    }
})(jQuery);