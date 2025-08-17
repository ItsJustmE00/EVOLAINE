import i18n from 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        // Hero section
        hero: {
          title: string;
          subtitle: string;
          description: string;
          cta_products: string;
          cta_contact: string;
        };
        
        // Common
        welcome: string;
        
        // Brand
        brand: {
          name: string;
        };
        
        // Header
        header: {
          banner1: string;
          banner2: string;
          banner3: string;
        };
        
        // Common UI
        common: {
          open_menu: string;
          close_menu: string;
        };
        
        // Navigation
        navigation: {
          home: string;
          products: string;
          about: string;
          testimonials: string;
          contact: string;
          cart: string;
          menu: string;
        };
        
        // Products
        products: {
          title: string;
          subtitle: string;
          addToCart: string;
          viewDetails: string;
          inCart: string;
          inStock: string;
          decrease: string;
          increase: string;
          items: {
            [key: number]: {
              name: string;
              description: string;
              detailedDescription: string;
              benefits: string[];
              howToUse: string;
              ingredients: string;
            };
          };
        };
        
        // About section
        about: {
          title: {
            line1: string;
            line2: string;
          };
          description1: string;
          description2: string;
          features: {
            natural: {
              title: string;
              subtitle: string;
            };
            certified: {
              title: string;
              subtitle: string;
            };
            clients: {
              title: string;
              subtitle: string;
            };
            local: {
              title: string;
              subtitle: string;
            };
          };
        };
        
        // Product detail
        productDetail: {
          description: string;
          benefits: string;
          howToUse: string;
          ingredients: string;
          quantity: string;
          addToCart: string;
          addToWishlist: string;
          adding: string;
          added: string;
          close: string;
        };
        
        // Contact
        contact: {
          title: string;
          subtitle: string;
          infoTitle: string;
          socialMediaTitle: string;
          phone: {
            title: string;
            number: string;
            availability: string;
          };
          hours: {
            title: string;
            weekdays: string;
            saturday: string;
          };
          address: {
            title: string;
            line1: string;
            line2: string;
          };
          form: {
            title: string;
            firstName: string;
            firstNamePlaceholder: string;
            lastName: string;
            lastNamePlaceholder: string;
            phone: string;
            subject: string;
            message: string;
            messagePlaceholder: string;
            submit: string;
            submitting: string;
            success: string;
            error: string;
            subjects: {
              product: string;
              order: string;
              return: string;
              other: string;
            };
          };
        };
        
        // Cart
        cart: {
          title: string;
          summary: string;
          subtotal: string;
          total: string;
          free_shipping: string;
          shipping_calculated_at_checkout: string;
          order_summary_details: string;
          secure_checkout: string;
          secured_payment: string;
          customer_information: string;
          contact_information: string;
          shipping_address: string;
          shipping_method: string;
          payment_method: string;
          review_order: string;
          place_order: string;
          thank_you: string;
          order_confirmation: string;
          order_number: string;
          order_details: string;
          billing_address: string;
          shipping_to: string;
          estimated_delivery: string;
          track_order: string;
          item: string;
          items: string;
          price: string;
          qty: string;
          remove: string;
          saving: string;
          discount: string;
          gift_wrapping: string;
          gift_message: string;
          special_instructions: string;
          special_instructions_placeholder: string;
          shipping_options: string;
          standard_shipping: string;
          express_shipping: string;
          payment_options: string;
          credit_card: string;
          paypal: string;
          cash_on_delivery: string;
          empty: {
            title: string;
            message: string;
            browseProducts: string;
          };
          form: {
            title: string;
            firstName: string;
            lastName: string;
            phone: string;
            address: string;
            city: string;
            notes: string;
            submit: string;
            required: string;
            cancel: string;
            success: {
              title: string;
              message: string;
              continue: string;
            };
            error: {
              title: string;
              message: string;
            };
          };
          success: {
            title: string;
            message: string;
            order_number: string;
            continue_shopping: string;
            track_order: string;
          };
          delivery_form: {
            title: string;
            first_name: string;
            last_name: string;
            phone: string;
            address: string;
            city: string;
            notes: string;
            submit: string;
            submitting: string;
            validation: {
              required: string;
              phone_invalid: string;
              email_invalid: string;
            };
          };
        };

        // Contact Info
        contact_info: {
          phone: {
            title: string;
            number: string;
          };
          email: {
            title: string;
            address: string;
          };
          address: {
            title: string;
            value: string;
          };
          hours: {
            title: string;
            value: string;
          };
        };

        // Navigation
        navigation: {
          home: string;
          products: string;
          about: string;
          contact: string;
          cart: string;
          login: string;
          register: string;
          profile: string;
          orders: string;
          logout: string;
        };

        // Testimonials
        testimonials: {
          title: string;
          subtitle: string;
          items: Array<{
            name: string;
            city: string;
            comment: string;
          }>;
        };

        // Brand
        brand: {
          name: string;
          tagline: string;
          description: string;
        };

        // Hero Section
        hero: {
          title: string;
          subtitle: string;
          description: string;
          cta_primary: string;
          cta_secondary: string;
        };

        // Products
        products: {
          title: string;
          description: string;
          view_all: string;
          add_to_cart: string;
          out_of_stock: string;
          in_stock: string;
          categories: {
            all: string;
            new: string;
            featured: string;
            best_sellers: string;
            on_sale: string;
          };
          sort: {
            default: string;
            newest: string;
            price_low_high: string;
            price_high_low: string;
            name_az: string;
            name_za: string;
          };
        };
      };
    };
  }
}
